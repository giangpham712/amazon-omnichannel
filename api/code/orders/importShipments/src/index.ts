import { createHandler } from '@webiny/handler-aws';
import { OrdersHandleShipmentNotificationContext } from 'api-orders-handle-shipment-notification/src/types';
import { createSellingPartner } from '@purity/selling-partner';
import { createElasticsearchClient } from '@webiny/api-elasticsearch/client';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { StoreLocationEntity } from '@purity/core/storeLocations';
import errorPlugins from '@purity/core/error/plugins';
import { createPurityContext } from '@purity/core';

const elasticsearch = createElasticsearchClient({
  endpoint: `https://${process.env.ELASTIC_SEARCH_ENDPOINT}`
});

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

const sendToNotificationsQueue = async (
  data: any,
  failureCount: number,
  { DelaySeconds = 20 }: { DelaySeconds: number }
) => {
  const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
  const params = {
    DelaySeconds,
    MessageAttributes: {
      FailureCount: {
        DataType: 'Number',
        StringValue: failureCount.toString()
      }
    },
    MessageBody: JSON.stringify(data),
    QueueUrl: process.env.ORDERS_NOTIFICATIONS_QUEUE as string
  };

  console.log(`Sending ${JSON.stringify(data)} to Orders Notification queue`);

  try {
    await sqs.sendMessage(params).promise();
  } catch (e) {
    console.log('Error occurred sending message to Orders Notification queue', e);
  }
};

const importShipmentsWithStatus = async (storeLocation: StoreLocationEntity, status: string, ago: number) => {
  console.log(`Getting ${status} shipments for ${storeLocation.name}`);

  let nextToken: string | null = null;
  const fromTime = new Date(Date.now() - ago);

  do {
    // @ts-ignore
    const { shipments, pagination } = await sellingPartner.listShipments(
      storeLocation.spSupplySourceId,
      status,
      fromTime,
      undefined,
      10,
      nextToken
    );

    nextToken = pagination?.nextToken;

    console.log('Shipments', shipments);

    const now = new Date();
    for (const shipment of shipments) {
      const notification = {
        notificationVersion: '1.0',
        notificationType: 'EXTERNAL_FULFILLMENT_SHIPMENT_STATUS_CHANGE',
        payloadVersion: '1.0',
        eventTime: now.toISOString(),
        payload: {
          externalFulfillmentShipmentNotification: {
            merchantId: 'A161OT36SON0IZ',
            locationId: shipment.locationId,
            channelName: shipment.channelName,
            shipmentId: shipment.id,
            shipmentStatus: shipment.status
          }
        },
        notificationMetadata: {
          applicationId: 'purity-orders-import-shipments',
          subscriptionId: '',
          publishTime: now.toISOString(),
          notificationId: uuidv4()
        }
      };

      await sendToNotificationsQueue(notification, 0, { DelaySeconds: 0 });
    }
  } while (!!nextToken);
};

export const handler = createHandler({
  plugins: [
    errorPlugins(),
    createPurityContext({
      elasticsearch
    }),
    {
      type: 'handler',
      async handle(context: OrdersHandleShipmentNotificationContext) {
        //
        console.log('Start importing shipments');

        const storeLocations = await context.storeLocations.getAll();

        for (const storeLocation of storeLocations) {
          if (!storeLocation.spSupplySourceId) {
            continue;
          }

          const fifteenMinutes = 1000 * 60 * 15;

          await importShipmentsWithStatus(storeLocation, 'ACCEPTED', fifteenMinutes);
          await importShipmentsWithStatus(storeLocation, 'CANCELLED', fifteenMinutes);
        }

        console.log('Finished importing shipments');
      }
    }
  ]
});
