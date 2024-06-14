import { DocumentClient } from 'aws-sdk/clients/dynamodb';

// https://github.com/jeremydaly/dynamodb-toolbox
import { Table } from 'dynamodb-toolbox';

/**
 * Everything starts with a table. Note that the `name` property is passed via an environment
 * variable, which is defined upon cloud infrastructure deployment. On the other hand, while
 * running tests, the value is read from cloud infrastructure state files (that were generated
 * during a previous deployment).
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */
export const table = new Table({
  name: process.env.DB_TABLE as string,
  partitionKey: 'PK',
  sortKey: 'SK',
  DocumentClient: new DocumentClient(),
  indexes: {
    GSI1: {
      partitionKey: 'GSI1_PK',
      sortKey: 'GSI1_SK'
    }
  }
});

export const esTable = new Table({
  name: process.env.DB_TABLE_ELASTICSEARCH as string,
  partitionKey: 'PK',
  sortKey: 'SK',
  DocumentClient: new DocumentClient()
});
