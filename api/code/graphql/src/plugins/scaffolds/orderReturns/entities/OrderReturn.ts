// https://github.com/jeremydaly/dynamodb-toolbox
import { Entity } from 'dynamodb-toolbox';
import table from './table';
import { OrderReturnEntity } from '../types';

/**
 * Once we have the table, we define the OrderReturnEntity entity.
 * If needed, additional entities can be defined using the same approach.
 */
export default new Entity<OrderReturnEntity>({
  table,
  name: 'OrderReturn',
  timestamps: false,
  attributes: {
    PK: { partitionKey: true },
    SK: { sortKey: true },
    id: { type: 'string' },
    returnId: { type: 'string' },
    marketplaceChannelDetails: { type: 'map' },
    creationDateTime: { type: 'string' },
    lastUpdatedDateTime: { type: 'string' },
    fulfillmentLocationId: { type: 'string' },
    merchantSku: { type: 'string' },
    numberOfUnits: { type: 'number' },
    returnMetadata: { type: 'map' },
    returnShippingInfo: { type: 'map' },
    returnType: { type: 'string' },
    status: { type: 'string' },
    createdOn: { type: 'string' },
    savedOn: { type: 'string' },
    createdBy: { type: 'map' },

    // Will store current version of Webiny, for example "5.9.1".
    // Might be useful in the future or while performing upgrades.
    webinyVersion: { type: 'string' }
  }
});
