// https://github.com/jeremydaly/dynamodb-toolbox
import { Entity } from 'dynamodb-toolbox';
import { table, esTable } from '../tables';
import { Order } from './types';

export const getPK = () => {
  return `L#Order`;
};

/**
 * Once we have the table, we define the OrderEntity entity.
 * If needed, additional entities can be defined using the same approach.
 */
export const orderEntity = new Entity<any>({
  table,
  name: 'Orders',
  timestamps: false,
  attributes: {
    PK: { partitionKey: true },
    SK: { sortKey: true },
    GSI1_PK: {
      type: 'string'
    },
    GSI1_SK: {
      type: 'string'
    },
    TYPE: {
      type: 'string'
    },
    id: { type: 'string' },
    status: { type: 'string' },
    shipmentId: { type: 'string' },
    shipmentLocationId: { type: 'string' },
    channelName: { type: 'string' },
    channelLocationId: { type: 'string' },
    metadata: { type: 'map' },
    lineItems: { type: 'list' },
    charges: { type: 'list' },
    packages: { type: 'list' },
    shippingInfo: { type: 'map' },
    shopifyOrder: { type: 'map' },
    creationDateTime: { type: 'string' },
    lastUpdatedDateTime: { type: 'string' },
    createdOn: { type: 'string' },
    savedOn: { type: 'string' },
    createdBy: { type: 'map' },
    archived: { type: 'boolean' },
    // Will store current version of Webiny, for example "5.9.1".
    // Might be useful in the future or while performing upgrades.
    webinyVersion: { type: 'string' }
  }
});

export const orderEsEntity = new Entity<any>({
  table: esTable,
  name: 'Orders',
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

export const getEsOrderData = ({
  id,
  shipmentId,
  shipmentLocationId,
  channelName,
  channelLocationId,
  status,
  archived,
  metadata,
  lineItems,
  charges,
  packages,
  shippingInfo,
  shopifyOrder,
  creationDateTime,
  lastUpdatedDateTime,
  createdOn,
  savedOn,
  createdBy
}: Order) => {
  return {
    __type: 'order',
    id,
    shipmentId,
    shipmentLocationId,
    channelName,
    channelLocationId,
    status,
    archived,
    metadata,
    lineItems,
    charges,
    packages,
    shippingInfo,
    shopifyOrder,
    creationDateTime,
    lastUpdatedDateTime,
    createdOn,
    savedOn,
    createdBy
  };
};
