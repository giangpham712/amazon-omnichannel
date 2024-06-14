import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import policies, { EsDomain } from './policies';

interface OrdersParams {
  env: Record<string, any>;
  primaryDynamodbTable: aws.dynamodb.Table;
  elasticsearchDynamodbTable: aws.dynamodb.Table;
  elasticsearchDomain: EsDomain;
}

const environment = String(process.env.WEBINY_ENV);
const prefix = environment !== 'prod' ? `${environment}-` : '';

class Orders {
  role: aws.iam.Role;
  functions: {
    handleShipmentNotification: aws.lambda.Function;
    confirmShipment: aws.lambda.Function;
    rejectShipment: aws.lambda.Function;
    handleError: aws.lambda.Function;
    importShipments: aws.lambda.Function;
  };
  queues: {
    notificationsQueue: aws.sqs.Queue;
    errorsQueue: aws.sqs.Queue;
  };

  constructor({ env, primaryDynamodbTable, elasticsearchDynamodbTable, elasticsearchDomain }: OrdersParams) {
    const roleName = `${prefix}orders-lambda-role`;
    this.role = new aws.iam.Role(roleName, {
      assumeRolePolicy: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Principal: {
              Service: 'lambda.amazonaws.com'
            },
            Effect: 'Allow'
          }
        ]
      }
    });

    const ordersDeadQueue = new aws.sqs.Queue(`${prefix}orders-dead`, {});

    const ordersNotificationsQueue = new aws.sqs.Queue(`${prefix}orders-notifications`, {
      visibilityTimeoutSeconds: 300,
      receiveWaitTimeSeconds: 5,
      redrivePolicy: ordersDeadQueue.arn.apply(arn =>
        JSON.stringify({
          deadLetterTargetArn: arn,
          maxReceiveCount: 5
        })
      )
    });

    new aws.sqs.QueuePolicy(`${prefix}orders-notifications-policy`, {
      queueUrl: ordersNotificationsQueue.id,
      policy: pulumi.interpolate`{
        "Id": "${ordersNotificationsQueue.name}-policy",
        "Version": "2012-10-17",
        "Statement": [
          {
            "Sid": "Stmt1652448198837",
            "Action": [
              "sqs:GetQueueAttributes",
              "sqs:SendMessage"
            ],
            "Effect": "Allow",
            "Resource": "${ordersNotificationsQueue.arn}",
            "Principal": {
              "AWS": [
                "437568002678"
              ]
            }
          }
        ]
      }
      `
    });

    const ordersErrorsQueue = new aws.sqs.Queue(`${prefix}orders-errors`, {
      visibilityTimeoutSeconds: 30,
      receiveWaitTimeSeconds: 5,
      redrivePolicy: ordersDeadQueue.arn.apply(arn =>
        JSON.stringify({
          deadLetterTargetArn: arn,
          maxReceiveCount: 1
        })
      )
    });

    const policy = policies.getOrdersLambdaPolicy({
      notificationsQueue: ordersNotificationsQueue,
      errorsQueue: ordersErrorsQueue,
      primaryDynamodbTable,
      elasticsearchDynamodbTable,
      elasticsearchDomain
    });

    const ordersConfirmShipment = new aws.lambda.Function(`${prefix}orders-confirm-shipment`, {
      role: this.role.arn,
      runtime: 'nodejs14.x',
      handler: 'handler.handler',
      timeout: 30,
      memorySize: 512,
      reservedConcurrentExecutions: 1,
      environment: {
        variables: {
          ...env,
          ORDERS_ERRORS_QUEUE: ordersErrorsQueue.url
        }
      },
      description: '',
      code: new pulumi.asset.AssetArchive({
        '.': new pulumi.asset.FileArchive('../code/orders/confirmShipment/build')
      })
    });

    const ordersRejectShipment = new aws.lambda.Function(`${prefix}orders-reject-shipment`, {
      role: this.role.arn,
      runtime: 'nodejs14.x',
      handler: 'handler.handler',
      timeout: 30,
      memorySize: 512,
      reservedConcurrentExecutions: 1,
      environment: {
        variables: {
          ...env,
          ORDERS_ERRORS_QUEUE: ordersErrorsQueue.url
        }
      },

      description: '',
      code: new pulumi.asset.AssetArchive({
        '.': new pulumi.asset.FileArchive('../code/orders/rejectShipment/build')
      })
    });

    new aws.iam.RolePolicyAttachment(`${roleName}-OrdersLambdaPolicy`, {
      role: this.role,
      policyArn: policy.arn.apply(arn => arn)
    });

    new aws.iam.RolePolicyAttachment(`${roleName}-AWSLambdaBasicExecutionRole`, {
      role: this.role,
      policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole
    });

    const ordersHandleError = new aws.lambda.Function(`${prefix}orders-handle-error`, {
      role: this.role.arn,
      runtime: 'nodejs14.x',
      handler: 'handler.handler',
      timeout: 30,
      memorySize: 512,
      reservedConcurrentExecutions: 1,
      environment: {
        variables: {
          ...env,
          ORDERS_NOTIFICATIONS_QUEUE: ordersNotificationsQueue.url
        }
      },
      description: '',
      code: new pulumi.asset.AssetArchive({
        '.': new pulumi.asset.FileArchive('../code/orders/handleError/build')
      })
    });

    new aws.lambda.EventSourceMapping(`${prefix}orders-errors-orders-handle-error`, {
      eventSourceArn: ordersErrorsQueue.arn,
      functionName: ordersHandleError.arn,
      batchSize: 1
    });

    const ordersHandleShipmentNotification = new aws.lambda.Function(`${prefix}orders-handle-shipment-notification`, {
      role: this.role.arn,
      runtime: 'nodejs14.x',
      handler: 'handler.handler',
      timeout: 60,
      memorySize: 512,
      reservedConcurrentExecutions: 1,
      environment: {
        variables: {
          ...env,
          ORDERS_NOTIFICATIONS_QUEUE: ordersNotificationsQueue.url,
          ORDERS_ERRORS_QUEUE: ordersErrorsQueue.url,
          ORDERS_CONFIRM_SHIPMENT_LAMBDA: ordersConfirmShipment.arn,
          ORDERS_CONFIRM_REJECT_LAMBDA: ordersConfirmShipment.arn
        }
      },
      description: '',
      code: new pulumi.asset.AssetArchive({
        '.': new pulumi.asset.FileArchive('../code/orders/handleShipmentNotification/build')
      })
    });

    new aws.lambda.EventSourceMapping(`${prefix}orders-notifications-orders-handle-shipment-notification`, {
      eventSourceArn: ordersNotificationsQueue.arn,
      functionName: ordersHandleShipmentNotification.arn,
      batchSize: 5
    });

    const ordersImportShipments = new aws.lambda.Function(`${prefix}orders-import-shipments`, {
      role: this.role.arn,
      runtime: 'nodejs14.x',
      handler: 'handler.handler',
      timeout: 30,
      memorySize: 512,
      reservedConcurrentExecutions: 1,
      environment: {
        variables: {
          ...env,
          ORDERS_NOTIFICATIONS_QUEUE: ordersNotificationsQueue.url,
          ORDERS_ERRORS_QUEUE: ordersErrorsQueue.url,
          ORDERS_CONFIRM_SHIPMENT_LAMBDA: ordersConfirmShipment.arn,
          ORDERS_CONFIRM_REJECT_LAMBDA: ordersConfirmShipment.arn
        }
      },
      description: '',
      code: new pulumi.asset.AssetArchive({
        '.': new pulumi.asset.FileArchive('../code/orders/importShipments/build')
      })
    });

    aws.cloudwatch.onSchedule(
      `${prefix}orders-import-shipments-schedule`,
      'cron(0/5 * * * ? *)',
      ordersImportShipments
    );

    this.functions = {
      handleShipmentNotification: ordersHandleShipmentNotification,
      rejectShipment: ordersRejectShipment,
      confirmShipment: ordersConfirmShipment,
      handleError: ordersHandleError,
      importShipments: ordersImportShipments
    };

    this.queues = {
      notificationsQueue: ordersNotificationsQueue,
      errorsQueue: ordersErrorsQueue
    };
  }
}

export default Orders;
