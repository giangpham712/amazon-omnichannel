import mdbid from 'mdbid';
import { Client } from '@elastic/elasticsearch';
import { queryOne } from '@webiny/db-dynamodb/utils/query';
import { cleanupItem } from '@webiny/db-dynamodb/utils/cleanup';
import { getEsOrderData, getPK, orderEntity, orderEsEntity } from './entities';
import WebinyError from '@webiny/error';
import {
  Order,
  ChargeLineItem,
  OrderLineItem,
  OrderMetadata,
  OrderPackage,
  OrdersCrud,
  OrderShippingInfo,
  ShopifyOrderInfo
} from './types';

const cleanupAttributes = ['TYPE'];

export interface CreateOrdersCrudParams {
  elasticsearch: Client;
}

export interface CreateOrderParams {
  shipmentId: string;
  locationId: string;
  channelName: string;
  channelLocationId: string;
  metadata: OrderMetadata;
  lineItems: OrderLineItem[];
  packages: OrderPackage[];
  shippingInfo: OrderShippingInfo;
  charges?: ChargeLineItem[];
  shopifyOrder?: ShopifyOrderInfo;
  creationDateTime: string;
  lastUpdatedDateTime: string;
  status: string;
}

export const createOrdersCrud = ({}: CreateOrdersCrudParams): OrdersCrud => {
  return {
    async getOrderById(id: string): Promise<Order> {
      let result;
      try {
        const response = await orderEntity.get({
          PK: `${getPK()}#${id}`,
          SK: 'O'
        });

        if (response.Item) {
          result = response.Item;
        }

        return cleanupItem(orderEntity, result, cleanupAttributes);
      } catch (e) {
        throw new WebinyError(`Could not get order from DynamoDB table. ${e.message}`, 'GET_ORDER_ERROR', {
          error: e,
          id
        });
      }
    },
    async getOrderByShipmentId(shipmentId: string): Promise<Order> {
      try {
        // Will throw an error if something goes wrong.
        const result = await queryOne<Order>({
          entity: orderEntity,
          partitionKey: getPK(),
          options: {
            index: 'GSI1',
            eq: shipmentId
          }
        });

        return cleanupItem(orderEntity, result, cleanupAttributes);
      } catch (e) {
        throw new WebinyError(`Could not get order from DynamoDB table. ${e.message}`, 'GET_ORDER_ERROR', {
          error: e,
          shipmentId
        });
      }
    },
    async createOrder(createOrderParams: CreateOrderParams) {
      const id = mdbid();
      const {
        shipmentId,
        channelName,
        channelLocationId,
        status,
        metadata,
        lineItems,
        charges,
        packages,
        creationDateTime,
        lastUpdatedDateTime,
        shippingInfo,
        shopifyOrder,
        locationId
      } = createOrderParams;

      const order = {
        PK: `${getPK()}#${id}`,
        SK: 'O',
        GSI1_PK: getPK(),
        GSI1_SK: shipmentId,
        id,
        shipmentId,
        status,
        TYPE: 'order',
        shipmentLocationId: locationId,
        channelName,
        channelLocationId,
        metadata,
        lineItems,
        charges,
        packages,
        shippingInfo,
        shopifyOrder,
        creationDateTime,
        lastUpdatedDateTime,
        createdOn: new Date().toISOString(),
        savedOn: new Date().toISOString(),
        createdBy: {
          id: 'SYSTEM',
          type: 'system',
          displayName: 'System'
        },
        webinyVersion: process.env.WEBINY_VERSION
      };

      try {
        // Will throw an error if something goes wrong.
        await orderEntity.put(order);
      } catch (e) {
        throw new WebinyError(`Could not insert order into the DynamoDB table. ${e.message}`, 'CREATE_ORDER_ERROR', {
          error: e,
          order,
          createOrderParams
        });
      }

      try {
        await orderEsEntity.put({
          index: 'root-order',
          PK: getPK(),
          SK: id,
          data: getEsOrderData(order)
        });
      } catch (e) {
        throw new WebinyError(
          `Could not insert order into the Elasticsearch DynamoDB table. ${e.message}`,
          'CREATE_ES_ORDER_ERROR',
          {
            error: e,
            order,
            createOrderParams
          }
        );
      }

      return order;
    },
    async updateOrder(
      id: string,
      orderUpdate: Partial<
        Pick<
          Order,
          | 'status'
          | 'archived'
          | 'lineItems'
          | 'packages'
          | 'shipmentLocationId'
          | 'shippingInfo'
          | 'shopifyOrder'
          | 'creationDateTime'
          | 'lastUpdatedDateTime'
        >
      >
    ) {
      const order = await this.getOrderById(id);
      if (order === null) {
        throw new WebinyError(`Order with ID ${id} doesn't exist.`, 'UPDATE_ORDER_ERROR', {
          id
        });
      }

      const updatedOrder = {
        ...cleanupItem(orderEntity, order),
        PK: `${getPK()}#${id}`,
        SK: 'O',
        GSI1_PK: getPK(),
        GSI1_SK: order.shipmentId,
        ...orderUpdate,
        savedOn: new Date().toISOString()
      };

      try {
        await orderEntity.put(updatedOrder);
      } catch (e) {
        throw new WebinyError(`Could not update order in the DynamoDB table. ${e.message}`, 'UPDATE_ORDER_ERROR', {
          error: e,
          updatedOrder,
          orderUpdate
        });
      }

      try {
        await orderEsEntity.put({
          index: 'root-order',
          PK: getPK(),
          SK: id,
          data: getEsOrderData(updatedOrder)
        });
      } catch (e) {
        throw new WebinyError(
          `Could not update order in the Elasticsearch DynamoDB table. ${e.message}`,
          'CREATE_ES_ORDER_ERROR',
          {
            error: e,
            order,
            orderUpdate
          }
        );
      }

      return updatedOrder;
    }
  };
};
