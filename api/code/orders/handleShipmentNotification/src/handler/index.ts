import { OrdersHandleShipmentNotificationContext } from '~/types';
import { Client } from '@elastic/elasticsearch';
import {
  ExternalFulfillmentShipmentNotification,
  SpExternalFulfillmentShipment,
  SellingPartner
} from '@purity/selling-partner/types';
import { Order } from '@purity/core/orders/types';
import { SQSMessageAttributes } from 'aws-lambda/trigger/sqs';
import SpApiError from '@purity/selling-partner/lib/CustomError';
import AWS from 'aws-sdk';

const environment = String(process.env.WEBINY_ENV);
const INVENTORY_BUFFER = parseInt(process.env.INVENTORY_BUFFER || '10');

export default ({ sellingPartner }: { sellingPartner: SellingPartner; elasticsearch: Client }) => {
  const lambda = new AWS.Lambda();

  const tryCommitInventory = async (context: OrdersHandleShipmentNotificationContext, order: Order) => {
    const { shipmentLocationId, lineItems } = order;

    const storeLocations = await context.storeLocations.getAll();
    const storeLocation = storeLocations.find(s => s.spSupplySourceId === shipmentLocationId);

    if (!storeLocation || !storeLocation.id) {
      return false;
    }

    for (const lineItem of lineItems) {
      const inventoryItem = await context.inventoryItems.getByLocationAndSku(storeLocation.id, lineItem.merchantSku);
      if (!inventoryItem || inventoryItem.sellableQuantity - INVENTORY_BUFFER < lineItem.numberOfUnits) {
        return false;
      } else {
        inventoryItem.sellableQuantity -= lineItem.numberOfUnits;
        inventoryItem.reservedQuantity += lineItem.numberOfUnits;
      }
    }

    return true;
  };

  const confirmShipment = async ({ shipmentId, locationId }: { shipmentId: string; locationId: string }) => {
    await lambda
      .invoke({
        FunctionName: process.env.ORDERS_CONFIRM_SHIPMENT_LAMBDA || '',
        InvocationType: 'Event',
        Payload: JSON.stringify({
          shipment: { shipmentId, locationId }
        })
      })
      .promise();
  };

  const rejectShipment = async ({
    shipmentId,
    locationId,
    lineItems
  }: {
    shipmentId: string;
    locationId: string;
    lineItems: { id: string; numberOfUnits: number }[];
  }) => {
    await lambda
      .invoke({
        FunctionName: process.env.ORDERS_REJECT_SHIPMENT_LAMBDA || '',
        InvocationType: 'Event',
        Payload: JSON.stringify({
          shipment: {
            shipmentId,
            locationId,
            lineItems
          }
        })
      })
      .promise();
  };

  const handleAccepted = async (
    context: OrdersHandleShipmentNotificationContext,
    shipmentId: string,
    notification: any,
    messageAttributes: SQSMessageAttributes
  ) => {
    try {
      const existingOrder = await context.orders.getOrderByShipmentId(shipmentId);

      if (existingOrder) {
        console.log(`Order already exists for shipment ${shipmentId}.`, existingOrder);
        return;
      }

      let shipment: SpExternalFulfillmentShipment;

      try {
        shipment = await sellingPartner.getShipment(shipmentId);
      } catch (e) {
        if (e instanceof SpApiError) {
          const { FailureCount } = messageAttributes;
          const { stringValue: failureCountStringValue } = FailureCount || { stringValue: '0' };
          const failureCount = parseInt(failureCountStringValue || '0');

          if (e.statusCode === 500 || e.statusCode === 503) {
            await context.errors.sendToErrorsQueue(`GET_SHIPMENT_${e.statusCode}`, notification, failureCount + 1, {
              DelaySeconds: e.statusCode === 500 ? 20 : 30
            });
            return;
          }
        }

        throw e;
      }

      if (shipment.status !== 'ACCEPTED') {
        return;
      }

      const order = await context.orders.createOrder({
        shipmentId: shipment.id,
        channelName: shipment.channelName,
        channelLocationId: shipment.channelLocationId,
        metadata: shipment.metadata,
        locationId: shipment.locationId,
        lineItems: shipment.lineItems,
        charges: shipment.charges,
        packages: [],
        shippingInfo: shipment.shippingInfo,
        creationDateTime: shipment.creationDateTime,
        lastUpdatedDateTime: shipment.lastUpdatedDateTime,
        status: shipment.status
      });

      console.log(`Order created for shipment ${shipmentId}`, order);

      if (environment !== 'prod') {
        return;
      }

      // Check inventory and confirm/reject order
      const canCommitInventory = tryCommitInventory(context, order);
      if (canCommitInventory) {
        await confirmShipment({
          shipmentId,
          locationId: shipment.locationId
        });

        // Create Shopify order
      } else {
        await rejectShipment({
          shipmentId,
          locationId: shipment.locationId,
          lineItems: shipment.lineItems
        });
      }
    } catch (e) {
      console.log('Error handling ACCEPTED order', e);
      throw e;
    }
  };

  return {
    type: 'handler',
    async handle(context: OrdersHandleShipmentNotificationContext) {
      const { args } = context;
      const [{ Records }] = args;

      if (!Records || Records.length === 0) {
        return;
      }

      console.log('Record count', Records.length);

      for (const record of Records) {
        const messageAttributes = record.messageAttributes;
        const notification = JSON.parse(record.body);
        const { notificationType, payload, notificationMetadata } = notification;
        if (notificationType !== 'EXTERNAL_FULFILLMENT_SHIPMENT_STATUS_CHANGE' || !payload) {
          return;
        }

        if (!!notificationMetadata.subscriptionId) {
          return;
        }

        const { externalFulfillmentShipmentNotification } = payload;
        if (!externalFulfillmentShipmentNotification) {
          return;
        }

        console.log('Handling external fulfillment shipment notification.', externalFulfillmentShipmentNotification);

        const { merchantId, locationId, shipmentId, shipmentStatus }: ExternalFulfillmentShipmentNotification =
          externalFulfillmentShipmentNotification;

        switch (shipmentStatus) {
          case 'ACCEPTED':
            await handleAccepted(context, shipmentId, notification, messageAttributes);
            break;

          case 'DELIVERED':
          case 'CANCELLED':
            {
              const existingOrder = await context.orders.getOrderByShipmentId(shipmentId);
              if (!existingOrder) {
                console.log(`Order for shipment ${shipmentId} doesn't exist.`, existingOrder);
                return;
              }

              if (existingOrder.status === 'DELIVERED' || existingOrder.status === 'CANCELLED') {
                console.log(
                  `Order already ${existingOrder.status.toLowerCase()} for shipment ${shipmentId}`,
                  existingOrder
                );
                return;
              }

              const updatedOrder = await context.orders.updateOrder(existingOrder.id, { status: shipmentStatus });
              console.log(`Order ${shipmentStatus.toLowerCase()} for shipment ${shipmentId}`, updatedOrder);
            }
            break;

          default: {
          }
        }
      }
    }
  };
};
