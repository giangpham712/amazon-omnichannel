import AWS from 'aws-sdk';

export const createErrorHandler = ({ errorsQueue }: { errorsQueue: string }) => {
  const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

  const sendToErrorsQueue = async (
    errorType: string,
    data: any,
    failureCount: number,
    { DelaySeconds = 20 }: { DelaySeconds: number }
  ) => {
    const params = {
      DelaySeconds,
      MessageAttributes: {
        ErrorType: {
          DataType: 'String',
          StringValue: errorType
        },
        FailureCount: {
          DataType: 'Number',
          StringValue: failureCount.toString()
        }
      },
      MessageBody: JSON.stringify(data),
      QueueUrl: errorsQueue
    };

    console.log('Sending to Orders Errors queue');
    await sqs.sendMessage(params).promise();
  };

  return {
    sendToErrorsQueue
  };
};
