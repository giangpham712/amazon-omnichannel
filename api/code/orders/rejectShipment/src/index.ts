import { createHandler } from '@webiny/handler-aws';

import { createSellingPartner } from '@purity/selling-partner';
import SpApiError from '@purity/selling-partner/lib/CustomError';
import { createElasticsearchClient } from '@webiny/api-elasticsearch/client';
import { OrdersRejectShipmentContext } from '~/types';
import { createPurityContext } from '@purity/core';
import { EmailType, sendEmail } from '@purity/email';
import { StoreLocationEntity } from '@purity/core/storeLocations';
import { Order } from '@purity/core/orders/types';

const sendOrderCancellationEmail = async (storeLocation: StoreLocationEntity, order: Order) => {
  if (!storeLocation.storeAdminEmail) {
    return;
  }

  try {
    const orderInfo = {
      id: order.id,
      shipmentId: order.shipmentId,
      shipmentLocationId: order.shipmentLocationId
    };
    console.log(`Sending cancellation email ${storeLocation.storeAdminEmail} for shipping ${orderInfo.shipmentId}.`);

    const sendEmailResult = await sendEmail({
      type: EmailType.OrderCancellation,
      to: storeLocation.storeAdminEmail?.split(','),
      data: {
        order,
        items: new Map([])
      }
    });

    console.log(`Sent order cancellation email. Send email result: ${JSON.stringify(sendEmailResult)}`);
  } catch (e) {
    console.warn(`Unable to send email notification. Error: ${e}.`);
  }
};

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

const elasticsearch = createElasticsearchClient({
  endpoint: `https://${process.env.ELASTIC_SEARCH_ENDPOINT}`
});

export const handler = createHandler({
  plugins: [
    createPurityContext({
      elasticsearch
    }),
    {
      type: 'handler',
      async handle(context: OrdersRejectShipmentContext) {
        const [{ shipment }] = context.args;
        const { shipmentId, lineItems }: { shipmentId: string; lineItems: { id: string; numberOfUnits: number }[] } =
          shipment;

        console.log(`Rejecting order ${shipmentId}`);

        const order = await context.orders.getOrderByShipmentId(shipmentId);
        if (!order) {
          return;
        }

        const storeLocation = await context.storeLocations.getStoreLocationBySPSupplySource(
          shipment.locationId || shipment.shipmentLocationId
        );

        try {
          await sellingPartner.rejectShipment(
            shipmentId,
            lineItems.map(lineItem => ({
              lineItem: {
                id: lineItem.id,
                quantity: lineItem.numberOfUnits
              },
              reason: 'OUT_OF_STOCK'
            }))
          );
        } catch (e) {
          if (e instanceof SpApiError) {
            if (e.statusCode === 500 || e.statusCode === 503) {
              await context.errors.sendToErrorsQueue(`REJECT_SHIPMENT_${e.statusCode}`, { shipment }, 1, {
                DelaySeconds: e.statusCode === 500 ? 20 : 30
              });
              return;
            }
          }
        }

        // Send confirmation email
        await sendOrderCancellationEmail(storeLocation, order);

        await context.orders.updateOrder(order.id, { status: 'CANCELLED' });

        console.log(`Rejected order ${shipmentId}`);
      }
    }
  ]
});
