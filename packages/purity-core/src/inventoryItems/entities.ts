import { Entity } from 'dynamodb-toolbox';
import { table, esTable } from '../tables';

export const InventoryItem = new Entity<any>({
  table,
  name: 'InventoryItem',
  timestamps: false,
  attributes: {
    PK: { partitionKey: true },
    SK: { sortKey: true },
    GSI1_PK: { type: 'string' },
    GSI1_SK: { type: 'string' },
    TYPE: { type: 'string' },
    id: { type: 'string' },
    asin: { type: 'string' },
    sku: { type: 'string' },
    productName: { type: 'string' },
    shopifyVariant: { type: 'map' },
    bufferedQuantity: { type: 'number' },
    reservedQuantity: { type: 'number' },
    sellableQuantity: { type: 'number' },
    spEtag: { type: 'string' },
    spVersion: { type: 'string' },
    storeLocation: { type: 'map' },
    productInfo: { type: 'map' },
    createdOn: { type: 'string' },
    savedOn: { type: 'string' },
    createdBy: { type: 'map' },

    // Will store current version of Webiny, for example "5.9.1".
    // Might be useful in the future or while performing upgrades.
    webinyVersion: { type: 'string' }
  }
});

export const InventoryItemES = new Entity<any>({
  table: esTable,
  name: 'InventoryItems',
  timestamps: false,
  attributes: {
    PK: { partitionKey: true },
    SK: { sortKey: true },
    index: {
      type: 'string'
    },
    data: {
      type: 'map'
    }
  }
});
