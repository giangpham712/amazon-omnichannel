// https://github.com/jeremydaly/dynamodb-toolbox
import { Entity } from 'dynamodb-toolbox';
import { table } from '../tables';

export const InventorySyncSession = new Entity<any>({
  table,
  name: 'InventorySyncSession',
  timestamps: false,
  attributes: {
    PK: { partitionKey: true },
    SK: { sortKey: true },
    GSI1_PK: { type: 'string' },
    GSI1_SK: { type: 'string' },
    TYPE: { type: 'string' },
    id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    startedAt: { type: 'string' },
    finishedAt: { type: 'string' },
    status: { type: 'string' },
    locations: { type: 'list' },
    createdOn: { type: 'string' },
    savedOn: { type: 'string' },
    createdBy: { type: 'map' },
    // Will store current version of Webiny, for example "5.9.1".
    // Might be useful in the future or while performing upgrades.
    webinyVersion: { type: 'string' }
  }
});
