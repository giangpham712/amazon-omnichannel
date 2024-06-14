import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import policies from './policies';

interface InventorySyncServiceParams {
  env: Record<string, any>;
  primaryDynamodbTable: aws.dynamodb.Table;
  elasticsearchDynamodbTable: aws.dynamodb.Table;
}

const environment = String(process.env.WEBINY_ENV);
const prefix = environment !== 'prod' ? `${environment}-` : '';

class InventorySyncService {
  role: aws.iam.Role;
  functions: {
    run: aws.lambda.Function;
  };
  schedule: aws.cloudwatch.EventRuleEventSubscription;

  constructor({ env, primaryDynamodbTable, elasticsearchDynamodbTable }: InventorySyncServiceParams) {
    const roleName = `${prefix}inventory-sync-service-lambda-role`;
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

    const policy = policies.getInventorySyncServiceLambdaPolicy({
      primaryDynamodbTable,
      elasticsearchDynamodbTable
    });

    new aws.iam.RolePolicyAttachment(`${roleName}-InventorySyncServiceLambdaPolicy`, {
      role: this.role,
      policyArn: policy.arn.apply(arn => arn)
    });

    new aws.iam.RolePolicyAttachment(`${roleName}-AWSLambdaBasicExecutionRole`, {
      role: this.role,
      policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole
    });

    const runFunc = new aws.lambda.Function(`${prefix}inventory-sync-service-run`, {
      role: this.role.arn,
      runtime: 'nodejs14.x',
      handler: 'handler.handler',
      timeout: 600,
      memorySize: 2048,
      // layers: [getLayerArn("shelf-io-chrome-aws-lambda-layer")],
      environment: {
        variables: {
          ...env
        }
      },
      description: 'Run full inventory sync from shopify to omnichannel for all locations',
      code: new pulumi.asset.AssetArchive({
        '.': new pulumi.asset.FileArchive('../code/inventorySyncService/build')
      })
    });

    const schedule: aws.cloudwatch.EventRuleEventSubscription = aws.cloudwatch.onSchedule(
      `${prefix}inventory-sync-schedule`,
      'rate(15 minutes)',
      runFunc
    );

    this.schedule = schedule;
    this.functions = {
      run: runFunc
    };
  }
}

export default InventorySyncService;
