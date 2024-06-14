import { OrderReturnEntity } from '../types';
/**
 * Package mdbid is missing types.
 */
// @ts-ignore
import mdbid from 'mdbid';
import { OrderReturn } from '../entities';
import OrderReturnsResolver from './OrderReturnsResolver';

interface CreateOrderReturnParams {
  data: {
    returnId: string;
    itemConditions: {
      sellable?: number;
      defective?: number;
      customerDamaged?: number;
      carrierDamaged?: number;
      fraud?: number;
      wrongItem?: number;
    };
  };
}

interface OrderReturnsMutation {
  createOrderReturn(params: CreateOrderReturnParams): Promise<OrderReturnEntity>;
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class OrderReturnsMutationImplementation extends OrderReturnsResolver implements OrderReturnsMutation {
  async createOrderReturn({
    data: {
      returnId,
      itemConditions: { sellable, defective, customerDamaged, carrierDamaged, fraud, wrongItem }
    }
  }: CreateOrderReturnParams): Promise<OrderReturnEntity> {
    // If entry is not found, we throw an error.
    const spReturn = await this.sellingPartner.getReturn(returnId);
    if (!spReturn) {
      throw new Error(`Return "${returnId}" not found.`);
    }

    const id = mdbid();

    const { security } = this.context;

    const identity = await security.getIdentity();

    await this.sellingPartner.processReturn(returnId, {
      sellable,
      defective,
      customerDamaged,
      carrierDamaged,
      fraud,
      wrongItem
    });

    const processedSpReturn = await this.sellingPartner.getReturn(returnId);

    const {
      marketplaceChannelDetails,
      creationDateTime,
      lastUpdatedDateTime,
      fulfillmentLocationId,
      merchantSku,
      numberOfUnits,
      returnMetadata,
      returnShippingInfo,
      returnType,
      status
    } = processedSpReturn;

    const orderReturn = {
      returnId,
      marketplaceChannelDetails,
      creationDateTime,
      lastUpdatedDateTime,
      fulfillmentLocationId,
      merchantSku,
      numberOfUnits,
      returnMetadata,
      returnShippingInfo,
      returnType,
      status,
      PK: this.getPK(),
      SK: id,
      id,
      createdOn: new Date().toISOString(),
      savedOn: new Date().toISOString(),
      createdBy: identity && {
        id: identity.id,
        type: identity.type,
        displayName: identity.displayName
      },
      webinyVersion: process.env.WEBINY_VERSION
    };

    // Will throw an error if something goes wrong.
    await OrderReturn.put(orderReturn);

    return orderReturn;
  }
}
