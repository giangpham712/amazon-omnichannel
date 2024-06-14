import Cognito from './cognito';
import DynamoDB from './dynamoDb';
import Graphql from './graphql';
import HeadlessCMS from './headlessCMS';
import ApiGateway from './apiGateway';
import Cloudfront from './cloudfront';
import ElasticSearch from './elasticSearch';
import FileManager from './fileManager';
import PageBuilder from './pageBuilder';
import Orders from './orders';
import PrerenderingService from './prerenderingService';
import InventorySyncService from './inventorySyncService';
import { ResourcesConfigs } from '../configs/types';

// Among other things, this determines the amount of information we reveal on runtime errors.
// https://www.webiny.com/docs/how-to-guides/environment-variables/#debug-environment-variable
const DEBUG = String(process.env.DEBUG);

import defaultConfigs from '../configs/default';
import prodConfigs from '../configs/prod';

const environment = String(process.env.WEBINY_ENV);
const configs: ResourcesConfigs = environment === 'prod' ? prodConfigs : defaultConfigs;

// Enables logs forwarding.
// https://www.webiny.com/docs/how-to-guides/use-watch-command#enabling-logs-forwarding
const WEBINY_LOGS_FORWARD_URL = String(process.env.WEBINY_LOGS_FORWARD_URL);

const SP_ENV = {
  SELLING_PARTNER_APP_CLIENT_ID: String(process.env.SELLING_PARTNER_APP_CLIENT_ID),
  SELLING_PARTNER_APP_CLIENT_SECRET: String(process.env.SELLING_PARTNER_APP_CLIENT_SECRET),
  SELLING_PARTNER_AWS_ACCESS_KEY_ID: String(process.env.SELLING_PARTNER_AWS_ACCESS_KEY_ID),
  SELLING_PARTNER_AWS_SECRET_ACCESS_KEY: String(process.env.SELLING_PARTNER_AWS_SECRET_ACCESS_KEY),
  AWS_SELLING_PARTNER_ROLE: String(process.env.AWS_SELLING_PARTNER_ROLE),
  AMZ_API_REFRESH_TOKEN: String(process.env.AMZ_API_REFRESH_TOKEN)
};

const SG_ENV = {
  SENDGRID_MAIL_SENDER: String(process.env.SENDGRID_MAIL_SENDER),
  SENDGRID_API_KEY: String(process.env.SENDGRID_API_KEY),
  SENDGRID_TEMPLATE_ORDER_CONFIRMATION: String(process.env.SENDGRID_TEMPLATE_ORDER_CONFIRMATION),
  SENDGRID_TEMPLATE_ORDER_CANCELLATION: String(process.env.SENDGRID_TEMPLATE_ORDER_CANCELLATION)
};

const MJ_ENV = {
  MAILJET_MAIL_SENDER: String(process.env.MAILJET_MAIL_SENDER),
  MAILJET_APIKEY_PUBLIC: String(process.env.MAILJET_APIKEY_PUBLIC),
  MAILJET_APIKEY_PRIVATE: String(process.env.MAILJET_APIKEY_PRIVATE),
  MAILJET_TEMPLATE_ORDER_CONFIRMATION: String(process.env.MAILJET_TEMPLATE_ORDER_CONFIRMATION),
  MAILJET_TEMPLATE_ORDER_CANCELLATION: String(process.env.MAILJET_TEMPLATE_ORDER_CANCELLATION),
  MAILJET_TEMPLATE_ORDER_REJECTION: String(process.env.MAILJET_TEMPLATE_ORDER_REJECTION)
};

const SHOPIFY_ENV = {
  SHOPIFY_HOSTNAME: String(process.env.SHOPIFY_HOSTNAME),
  SHOPIFY_API_KEY: String(process.env.SHOPIFY_API_KEY),
  SHOPIFY_API_PASSWORD: String(process.env.SHOPIFY_API_PASSWORD),
  SHOPIFY_API_SECRET_KEY: String(process.env.SHOPIFY_API_SECRET_KEY)
};

export default () => {
  const dynamoDb = new DynamoDB();
  const cognito = new Cognito();
  const elasticSearch = new ElasticSearch(configs.elasticSearch);
  const fileManager = new FileManager();

  const commonEnv = {
    APP_ADMIN_BASE_URL: String(process.env.APP_ADMIN_BASE_URL),
    DB_TABLE: dynamoDb.table.name,
    DB_TABLE_ELASTICSEARCH: elasticSearch.table.name,

    ...SP_ENV,
    ...SHOPIFY_ENV,
    ...SG_ENV,
    ...MJ_ENV,

    TEST_MODE: String(process.env.TEST_MODE),

    DEBUG,
    WEBINY_ENV: process.env.WEBINY_ENV,
    WEBINY_LOGS_FORWARD_URL
  };

  const prerenderingService = new PrerenderingService({
    env: {
      DB_TABLE: dynamoDb.table.name,
      DB_TABLE_ELASTICSEARCH: elasticSearch.table.name,
      DEBUG
    },
    primaryDynamodbTable: dynamoDb.table,
    elasticsearchDynamodbTable: elasticSearch.table,
    bucket: fileManager.bucket
  });

  const pageBuilder = new PageBuilder({
    env: {
      COGNITO_REGION: String(process.env.AWS_REGION),
      COGNITO_USER_POOL_ID: cognito.userPool.id,
      DB_TABLE: dynamoDb.table.name,
      DB_TABLE_ELASTICSEARCH: elasticSearch.table.name,
      ELASTIC_SEARCH_ENDPOINT: elasticSearch.domain.endpoint,

      // Not required. Useful for testing purposes / ephemeral environments.
      // https://www.webiny.com/docs/key-topics/ci-cd/testing/slow-ephemeral-environments
      ELASTIC_SEARCH_INDEX_PREFIX: process.env.ELASTIC_SEARCH_INDEX_PREFIX,

      S3_BUCKET: fileManager.bucket.id,
      DEBUG,
      WEBINY_LOGS_FORWARD_URL
    },
    primaryDynamodbTable: dynamoDb.table,
    elasticsearchDynamodbTable: elasticSearch.table,
    elasticsearchDomain: elasticSearch.domain,
    bucket: fileManager.bucket,
    cognitoUserPool: cognito.userPool
  });

  const orders = new Orders({
    env: { ...commonEnv, ELASTIC_SEARCH_ENDPOINT: elasticSearch.domain.endpoint },
    primaryDynamodbTable: dynamoDb.table,
    elasticsearchDynamodbTable: elasticSearch.table,
    elasticsearchDomain: elasticSearch.domain
  });

  const api = new Graphql({
    env: {
      COGNITO_REGION: String(process.env.AWS_REGION),
      COGNITO_USER_POOL_ID: cognito.userPool.id,
      DB_TABLE: dynamoDb.table.name,
      DB_TABLE_ELASTICSEARCH: elasticSearch.table.name,
      ELASTIC_SEARCH_ENDPOINT: elasticSearch.domain.endpoint,

      // Not required. Useful for testing purposes / ephemeral environments.
      // https://www.webiny.com/docs/key-topics/ci-cd/testing/slow-ephemeral-environments
      ELASTIC_SEARCH_INDEX_PREFIX: process.env.ELASTIC_SEARCH_INDEX_PREFIX,

      PRERENDERING_RENDER_HANDLER: prerenderingService.functions.render.arn,
      PRERENDERING_FLUSH_HANDLER: prerenderingService.functions.flush.arn,
      PRERENDERING_QUEUE_ADD_HANDLER: prerenderingService.functions.queue.add.arn,
      PRERENDERING_QUEUE_PROCESS_HANDLER: prerenderingService.functions.queue.process.arn,
      S3_BUCKET: fileManager.bucket.id,
      IMPORT_PAGES_CREATE_HANDLER: pageBuilder.functions.importPages.create.arn,
      EXPORT_PAGES_PROCESS_HANDLER: pageBuilder.functions.exportPages.process.arn,

      ...SP_ENV,
      ...SG_ENV,
      ...MJ_ENV,

      ORDERS_NOTIFICATIONS_QUEUE: orders.queues.notificationsQueue.url,
      ORDERS_ERRORS_QUEUE: orders.queues.errorsQueue.url,

      WEBINY_LOGS_FORWARD_URL
    },
    primaryDynamodbTable: dynamoDb.table,
    elasticsearchDynamodbTable: elasticSearch.table,
    elasticsearchDomain: elasticSearch.domain,
    bucket: fileManager.bucket,
    cognitoUserPool: cognito.userPool
  });

  const headlessCms = new HeadlessCMS({
    env: {
      COGNITO_REGION: String(process.env.AWS_REGION),
      COGNITO_USER_POOL_ID: cognito.userPool.id,
      DB_TABLE: dynamoDb.table.name,
      DB_TABLE_ELASTICSEARCH: elasticSearch.table.name,
      ELASTIC_SEARCH_ENDPOINT: elasticSearch.domain.endpoint,

      // Not required. Useful for testing purposes / ephemeral environments.
      // https://www.webiny.com/docs/key-topics/ci-cd/testing/slow-ephemeral-environments
      ELASTIC_SEARCH_INDEX_PREFIX: process.env.ELASTIC_SEARCH_INDEX_PREFIX,

      S3_BUCKET: fileManager.bucket.id,
      DEBUG,
      WEBINY_LOGS_FORWARD_URL
    },
    primaryDynamodbTable: dynamoDb.table,
    elasticsearchDynamodbTable: elasticSearch.table,
    elasticsearchDomain: elasticSearch.domain
  });

  const apiGateway = new ApiGateway({
    routes: [
      {
        name: 'graphql-post',
        path: '/graphql',
        method: 'POST',
        function: api.functions.api
      },
      {
        name: 'graphql-options',
        path: '/graphql',
        method: 'OPTIONS',
        function: api.functions.api
      },
      {
        name: 'files-any',
        path: '/files/{path}',
        method: 'ANY',
        function: fileManager.functions.download
      },
      {
        name: 'cms-post',
        path: '/cms/{key+}',
        method: 'POST',
        function: headlessCms.functions.graphql
      },
      {
        name: 'cms-options',
        path: '/cms/{key+}',
        method: 'OPTIONS',
        function: headlessCms.functions.graphql
      }
    ]
  });

  const cloudfront = new Cloudfront({ apiGateway });

  const inventorySyncService = new InventorySyncService({
    env: { ...commonEnv },
    primaryDynamodbTable: dynamoDb.table,
    elasticsearchDynamodbTable: elasticSearch.table
  });

  return {
    region: process.env.AWS_REGION,
    apiUrl: cloudfront.cloudfront.domainName.apply(value => `https://${value}`),
    cognitoUserPoolId: cognito.userPool.id,
    cognitoAppClientId: cognito.userPoolClient.id,
    cognitoUserPoolPasswordPolicy: cognito.userPool.passwordPolicy,
    updatePbSettingsFunction: pageBuilder.functions.updateSettings.arn,
    psQueueAdd: prerenderingService.functions.queue.add.arn,
    psQueueProcess: prerenderingService.functions.queue.process.arn,
    dynamoDbTable: dynamoDb.table.name,
    dynamoDbElasticsearchTable: elasticSearch.table.name,
    ordersNotificationsQueue: orders.queues.notificationsQueue.url,
    ordersImport: orders.functions.handleShipmentNotification.arn,
    ordersErrorsQueue: orders.queues.errorsQueue.url,
    ordersHandleError: orders.functions.handleError.arn,
    inventorySyncSchedule: inventorySyncService.functions.run.arn
  };
};
