import { createHandler } from '@webiny/handler-aws';
import { OrdersConfirmShipmentContext } from './types';
import { createSellingPartner } from '@purity/selling-partner';
import SpApiError from '@purity/selling-partner/lib/CustomError';
import { createElasticsearchClient } from '@webiny/api-elasticsearch/client';
import { createShopifyClient } from '@purity/shopify-api';
import { createPurityContext } from '@purity/core';
import { EmailType, sendEmail } from '@purity/email';
import { StoreLocationEntity } from '@purity/core/storeLocations';
import { Order } from '@purity/core/orders/types';
import { InventoryItemEntity, InventoryItemsCrud } from '@purity/core/inventoryItems';

const sellingPartner = createSellingPartner({
  useSandbox: false,
  credentials: {
    SELLING_PARTNER_APP_CLIENT_ID: process.env.SELLING_PARTNER_APP_CLIENT_ID || '',
    SELLING_PARTNER_APP_CLIENT_SECRET: process.env.SELLING_PARTNER_APP_CLIENT_SECRET || '',
    AWS_ACCESS_KEY_ID: process.env.SELLING_PARTNER_AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.SELLING_PARTNER_AWS_SECRET_ACCESS_KEY || '',
    AWS_SELLING_PARTNER_ROLE: process.env.AWS_SELLING_PARTNER_ROLE || ''
  },
  refreshToken: process.env.AMZ_API_REFRESH_TOKEN || ''
});

const shopifyConfig = {
  shopName: process.env.SHOPIFY_HOSTNAME || '',
  apiKey: process.env.SHOPIFY_API_KEY || '',
  password: process.env.SHOPIFY_API_PASSWORD || ''
};

const shopifyClient = createShopifyClient(shopifyConfig);

const elasticsearch = createElasticsearchClient({
  endpoint: `https://${process.env.ELASTIC_SEARCH_ENDPOINT}`
});

const sendOrderConfirmationEmail = async (
  storeLocation: StoreLocationEntity,
  order: Order,
  inventoryItemsMapBySku: Map<string, InventoryItemEntity>
) => {
  if (!storeLocation.storeAdminEmail) {
    return;
  }

  try {
    const orderInfo = {
      id: order.id,
      shipmentId: order.shipmentId,
      shipmentLocationId: order.shipmentLocationId
    };
    console.log(
      `Sending confirmation email to ${storeLocation.storeAdminEmail} for shipment: ${orderInfo.shipmentId}.`
    );

    const sendEmailResult = await sendEmail({
      type: EmailType.OrderConfirmation,
      to: storeLocation.storeAdminEmail?.split(','),
      data: {
        order,
        items: inventoryItemsMapBySku
      }
    });

    console.log(`Sent order confirmation email. Send email result: ${JSON.stringify(sendEmailResult)}`);
  } catch (e) {
    console.warn(`Unable to send email notification. Error: ${e}.`);
  }
};

const getInventoryItems = async (
  order: Order,
  inventoryItems: InventoryItemsCrud,
  storeLocation: StoreLocationEntity
) => {
  const getLineItems = order.lineItems.map(async ({ merchantSku }) => {
    return await inventoryItems.getByLocationAndSku(storeLocation.id, merchantSku);
  });

  return await Promise.all(getLineItems);
};

const createShopifyOrder = async (
  storeLocation: StoreLocationEntity,
  order: Order,
  items: Map<string, InventoryItemEntity>
) => {
  try {
    const locationId = storeLocation.shopifyLocationId;

    if (!locationId) {
      return null;
    }

    const spShipment = await sellingPartner.getShipment(order.shipmentId);

    const lineItems = order.lineItems.map(line => {
      const variantId = items.get(line.merchantSku)?.shopifyVariant?.id;
      if (!variantId) {
        throw new Error(`Unable to find variant id for ${line.merchantSku}`);
      }

      const lineItemCharge =
        line.charges?.find(charge => charge.chargeType === 'product') ??
        spShipment.lineItems
          ?.find(x => x.merchantSku == line.merchantSku)
          ?.charges?.find(charge => charge.chargeType == 'product');
      const lineItemNetAmount = lineItemCharge?.baseCharge?.netAmount?.value ?? 0;
      const lineItemDiscount = lineItemCharge?.baseCharge?.discountAmount?.value ?? 0;
      const lineItemPrice = lineItemNetAmount / line.numberOfUnits;

      return {
        variantId: variantId,
        quantity: line.numberOfUnits,
        price: lineItemPrice,
        totalDiscount: lineItemDiscount
      };
    });

    const totalCharge = (order.charges ?? spShipment?.charges)?.find(charge => charge.chargeType == 'total');
    const totalTax = totalCharge?.totalTax?.charge?.netAmount?.value;
    const totalPrice = totalCharge?.totalCharge?.netAmount?.value;
    const totalDiscount = totalCharge?.totalCharge?.discountAmount?.value;

    const shopifyOrder = await shopifyClient.createOrder({
      locationId: locationId,
      lineItems: lineItems,
      totalTax: totalTax ?? 0,
      totalDiscount: totalDiscount ?? 0,
      totalPrice: totalPrice ?? 0
    });

    return {
      orderId: shopifyOrder.id,
      orderNumber: shopifyOrder.name,
      shopifyDomain: shopifyConfig.shopName
    };
  } catch (e) {
    console.log(`Unable to create shopify order. ${e}`);
    return undefined;
  }
};

export const handler = createHandler({
  plugins: [
    createPurityContext({
      elasticsearch
    }),
    {
      type: 'handler',
      handle: async function (context: OrdersConfirmShipmentContext) {
        const [{ shipment, disableConfirmShipment = false }] = context.args;
        const { shipmentId }: { shipmentId: string } = shipment;

        console.log(`Confirming order ${shipmentId}`);

        const order = await context.orders.getOrderByShipmentId(shipmentId);
        if (!order) {
          return;
        }

        const storeLocation = await context.storeLocations.getStoreLocationBySPSupplySource(
          shipment.locationId || shipment.shipmentLocationId
        );
        if (!storeLocation) {
          //TODO: Return error
          return;
        }

        try {
          if (!disableConfirmShipment) {
            await sellingPartner.confirmShipment(shipmentId);
          }
        } catch (e) {
          if (e instanceof SpApiError) {
            if (e.statusCode === 500 || e.statusCode === 503) {
              await context.errors.sendToErrorsQueue(`CONFIRM_SHIPMENT_${e.statusCode}`, { shipment }, 1, {
                DelaySeconds: e.statusCode === 500 ? 20 : 30
              });
              return;
            }
          }
        }

        const inventoryItems = await getInventoryItems(order, context.inventoryItems, storeLocation);
        const inventoryItemsMapBySku = new Map(inventoryItems.map(item => [item.sku, item]));

        // Send confirmation email
        await sendOrderConfirmationEmail(storeLocation, order, inventoryItemsMapBySku);

        const shouldCreateShopifyOrder = false;
        if (shouldCreateShopifyOrder) {
          // Create Shopify order
          const shopifyOrder = await createShopifyOrder(storeLocation, order, inventoryItemsMapBySku);

          // Update order
          const updatedOrder = await context.orders.updateOrder(order.id, {
            status: 'CONFIRMED',
            shopifyOrder: shopifyOrder
              ? {
                  orderId: shopifyOrder.orderId,
                  orderNumber: shopifyOrder.orderNumber,
                  shopifyDomain: shopifyOrder.shopifyDomain
                }
              : undefined
          });
        } else {
          const updatedOrder = await context.orders.updateOrder(order.id, {
            status: 'CONFIRMED'
          });
        }

        console.log(`Confirmed order ${shipmentId}`);
      }
    }
  ]
});
