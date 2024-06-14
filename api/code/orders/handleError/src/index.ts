import AWS from 'aws-sdk';
import { createHandler } from '@webiny/handler-aws';
import { Context } from './types';

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

  console.log('Sending to Orders Notification queue');

  await sqs.sendMessage(params).promise();
};

export const handler = createHandler({
  plugins: [
    {
      type: 'handler',
      async handle(context: Context) {
        const [{ Records }] = context.args;
        if (!Records || Records.length === 0) {
          return;
        }

        const {
          ErrorType: { stringValue: errorType },
          FailureCount
        } = Records[0].messageAttributes;

        const { stringValue: failureCountStringValue } = FailureCount || { stringValue: '1' };
        const failureCount = parseInt(failureCountStringValue || '1');

        console.log(`Handling error ${errorType}`);

        switch (errorType) {
          case 'GET_SHIPMENT_500':
            {
              const notification = JSON.parse(Records[0].body);
              if (failureCount < 3) {
                await sendToNotificationsQueue(notification, failureCount, { DelaySeconds: 0 });
              } else {
                // No more retry
              }
            }
            break;
          case 'GET_SHIPMENT_503':
            {
              const notification = JSON.parse(Records[0].body);
              const { eventTime } = notification;
              const tenMinutesAgo = new Date(Date.now() - 1000 * 60 * 15);

              if (new Date(eventTime) > tenMinutesAgo) {
                // less than 10 minutes
                await sendToNotificationsQueue(notification, failureCount, { DelaySeconds: 0 });
              } else {
                // No more retry
              }
            }
            break;
          case 'CONFIRM_SHIPMENT_500':
            {
              const { shipmentId } = JSON.parse(Records[0].body);
            }
            break;
        }
      }
    }
  ]
});
