import { Order } from '@purity/core/orders/types';
import { orderEntity, getPK } from '@purity/core/orders/entities';
import OrdersResolver from './OrdersResolver';
import { ElasticsearchSearchResponse } from '@webiny/api-elasticsearch/types';
import { decodeCursor, encodeCursor } from '@webiny/api-elasticsearch/cursors';
import WebinyError from '@webiny/error';

const environment = String(process.env.WEBINY_ENV);

/**
 * Contains base `getOrder` and `listOrders` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement security-related checks.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */

interface GetOrderParams {
  id: string;
}

interface ListOrdersParams {
  sort?: 'createdOn_ASC' | 'createdOn_DESC';
  limit?: number;
  after?: string;
  search?: string;
  where?: {
    shipmentLocationId?: string;
    status?: string;
    archived?: boolean;
  };
}

interface ListOrdersResponse {
  data: Order[];
  meta: {
    cursor: string | null;
    totalCount: number;
    hasMoreItems: boolean;
  };
}

interface OrdersQuery {
  getOrder(params: GetOrderParams): Promise<Order>;
  listOrders(params: ListOrdersParams): Promise<ListOrdersResponse>;
}

const FIELD_MAP = {
  shipmentLocationId: {
    path: 'shipmentLocationId',
    keyword: true
  },
  status: {
    path: 'status',
    keyword: true
  },
  archived: {
    path: 'archived',
    keyword: false
  }
};

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class OrdersQueryImplementation extends OrdersResolver implements OrdersQuery {
  /**
   * Returns a single Order entry from the database.
   * @param id
   */
  async getOrder({ id }: GetOrderParams) {
    // Query the database and return the entry. If entry was not found, an error is thrown.
    const { Item: order } = await orderEntity.get({ PK: `${getPK()}#${id}`, SK: 'O' });
    if (!order) {
      throw new Error(`Order "${id}" not found.`);
    }

    return order;
  }

  /**
   * List multiple Order entries from the database.
   * Supports basic sorting and cursor-based pagination.
   * @param limit
   * @param sort
   * @param after
   * @param before
   */
  async listOrders({ limit = 10, sort, after, search, where }: ListOrdersParams) {
    let response: ElasticsearchSearchResponse<Order>;

    const must = [];

    try {
      const searchBody = {
        size: limit + 1,
        query: {
          bool: {
            filter: [],
            must,
            must_not: []
          }
        },
        sort: [
          {
            _script: {
              script:
                "doc['status.keyword'].value == 'CONFIRMED' ? 2 : (doc['status.keyword'].value == 'CANCELLED' ? 0 : 1)",
              type: 'number',
              order: 'desc'
            }
          },
          {
            creationDateTime: 'desc'
          }
        ],
        search_after: decodeCursor(after) as any
      };

      if (search) {
        searchBody.query.bool.must.push({
          wildcard: {
            shipmentId: `*${search}*`
          }
        });
      }

      if (!where || !where.archived) {
        searchBody.query.bool.must_not.push({
          term: {
            archived: true
          }
        });
      }

      for (const key in where || {}) {
        if (where.hasOwnProperty(key) === false) {
          continue;
        }

        if (where[key] === undefined || !FIELD_MAP[key]) {
          continue;
        }

        const fieldMapping = FIELD_MAP[key];

        const queryType = Array.isArray(where[key]) ? 'terms' : 'term';

        const path = `${fieldMapping.path}${fieldMapping.keyword ? '.keyword' : ''}`;

        searchBody.query.bool.filter.push({
          [queryType]: {
            [path]: where[key]
          }
        });
      }

      response = await this.context.elasticsearch.search({
        index: 'root-order',
        body: searchBody
      });

      console.log('Search body', JSON.stringify(searchBody));
    } catch (ex) {
      throw new WebinyError(ex.message, ex.code || 'LIST_CATEGORIES_ERROR', {});
    }

    const { hits, total } = response.body.hits;
    const items = hits.map(item => item._source);

    const hasMoreItems = items.length > limit;
    if (hasMoreItems) {
      /**
       * Remove the last item from results, we don't want to include it.
       */
      items.pop();
    }

    const meta = {
      hasMoreItems,
      totalCount: total.value,
      cursor: items.length > 0 && hasMoreItems ? encodeCursor(hits[items.length - 1].sort) || null : null
    };

    return {
      data: items,
      meta
    };
  }
}
