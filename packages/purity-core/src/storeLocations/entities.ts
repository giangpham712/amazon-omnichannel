// https://github.com/jeremydaly/dynamodb-toolbox
import { Entity } from 'dynamodb-toolbox';
import { table } from '../tables';
import { StoreLocationEntity } from './types';

/**
 * Once we have the table, we define the StoreLocationEntity entity.
 * If needed, additional entities can be defined using the same approach.
 */
export default new Entity<StoreLocationEntity>({
  table,
  name: 'StoreLocation',
  timestamps: false,
  attributes: {
    PK: { partitionKey: true },
    SK: { sortKey: true },
    GSI1_PK: { type: 'string' },
    GSI1_SK: { type: 'string' },
    TYPE: { type: 'string' },
    id: { type: 'string' },
    name: { type: 'string' },
    spSupplySourceId: { type: 'string' },
    spSupplySourceCode: { type: 'string' },
    shopifyDomain: { type: 'string' },
    shopifyLocationId: { type: 'string' },
    storeAdminEmail: { type: 'string' },
    createdOn: { type: 'string' },
    savedOn: { type: 'string' },
    createdBy: { type: 'map' },

    // Will store current version of Webiny, for example "5.9.1".
    // Might be useful in the future or while performing upgrades.
    webinyVersion: { type: 'string' }
  }
});
