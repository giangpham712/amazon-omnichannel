import { OrderReturnEntity } from '../types';
import { OrderReturn } from '../entities';
import OrderReturnsResolver from './OrderReturnsResolver';

/**
 * Contains base `getOrderReturn` and `listOrderReturns` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement security-related checks.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */

interface GetOrderReturnParams {
  id: string;
}

interface ListOrderReturnsParams {
  sort?: 'createdOn_ASC' | 'createdOn_DESC';
  limit?: number;
  after?: string;
  before?: string;
}

interface ListPendingOrderReturnsByRmaIdParams {
  rmaId: string;
}

interface ListOrderReturnsResponse {
  data: OrderReturnEntity[];
  meta: { limit: number; after: string | null; before: string | null };
}

interface OrderReturnsQuery {
  getOrderReturn(params: GetOrderReturnParams): Promise<OrderReturnEntity>;
  listOrderReturns(params: ListOrderReturnsParams): Promise<ListOrderReturnsResponse>;
}

interface OrderReturnsQueryParams {
  limit?: number;
  reverse?: boolean;
  gt?: string | number;
  lt?: string | number;
}

interface OrderReturnsMetaParams {
  limit: number;
  after: string | null;
  before: string | null;
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class OrderReturnsQueryImplementation extends OrderReturnsResolver implements OrderReturnsQuery {
  /**
   * Returns a single OrderReturn entry from the database.
   * @param id
   */
  async getOrderReturn({ id }: GetOrderReturnParams) {
    // Query the database and return the entry. If entry was not found, an error is thrown.
    const { Item: orderReturn } = await OrderReturn.get({ PK: this.getPK(), SK: id });
    if (!orderReturn) {
      throw new Error(`OrderReturn "${id}" not found.`);
    }

    return orderReturn;
  }

  /**
   * List multiple OrderReturn entries from the database.
   * Supports basic sorting and cursor-based pagination.
   * @param limit
   * @param sort
   * @param after
   * @param before
   */
  async listOrderReturns({ limit = 10, sort, after, before }: ListOrderReturnsParams) {
    const PK = this.getPK();
    const query: OrderReturnsQueryParams = {
      limit,
      reverse: sort !== 'createdOn_ASC',
      gt: undefined,
      lt: undefined
    };
    const meta: OrderReturnsMetaParams = { limit, after: null, before: null };

    // The query is constructed differently, depending on the "before" or "after" values.
    if (before) {
      query.reverse = !query.reverse;
      if (query.reverse) {
        query.lt = before;
      } else {
        query.gt = before;
      }

      const { Items } = await OrderReturn.query(PK, { ...query, limit: limit + 1 });

      const data = Items.slice(0, limit).reverse();

      const hasBefore = Items.length > limit;
      if (hasBefore) {
        meta.before = Items[Items.length - 1].id;
      }

      meta.after = Items[0].id;

      return { data, meta };
    }

    if (after) {
      if (query.reverse) {
        query.lt = after;
      } else {
        query.gt = after;
      }
    }

    const { Items } = await OrderReturn.query(PK, { ...query, limit: limit + 1 });

    const data = Items.slice(0, limit);

    const hasAfter = Items.length > limit;
    if (hasAfter) {
      meta.after = Items[limit - 1].id;
    }

    if (after) {
      meta.before = Items[0].id;
    }

    return { data, meta };
  }

  async listPendingOrderReturnsByRmaId({ rmaId }: ListPendingOrderReturnsByRmaIdParams) {
    const { returns: spReturns } = await this.sellingPartner.listReturns(rmaId);
    if (!spReturns?.length) {
      return { data: [] };
    }

    return {
      data: spReturns.map(spReturn => ({
        returnId: spReturn.id,
        ...spReturn
      }))
    };
  }
}
