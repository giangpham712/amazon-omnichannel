import { InventoryItemEntity } from '@purity/core/inventoryItems/types';
import { InventoryItem } from '@purity/core/inventoryItems/entities';
import InventoryItemsResolver from './InventoryItemsResolver';
import { getGSI1SK } from '@purity/core/inventoryItems/crud';
import { ElasticsearchSearchResponse } from '@webiny/api-elasticsearch/types';
import { decodeCursor, encodeCursor } from '@webiny/api-elasticsearch/cursors';
import WebinyError from '@webiny/error';

/**
 * Contains base `getInventoryItem` and `listInventoryItems` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement security-related checks.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */

interface GetInventoryItemParams {
  id: string;
}

interface ListInventoryItemsParams {
  sort?: 'createdOn_ASC' | 'createdOn_DESC' | 'sku_ASC' | 'sku_DESC' | 'productName_ASC' | 'productName_DESC';
  limit?: number;
  after?: string;
  before?: string;
  search?: string;
  where?: {
    skus?: string[];
    storeLocationId?: string;
    stockStatus?: string;
  };
}

interface ListInventoryItemsResponse {
  data: InventoryItemEntity[];
  meta: {
    cursor: string | null;
    totalCount: number;
    hasMoreItems: boolean;
  };
}

interface GetInventoryItemBySkuAndLocationParams {
  sku: string;
  locationId: string;
}

interface InventoryItemsQuery {
  getInventoryItem(params: GetInventoryItemParams): Promise<InventoryItemEntity>;
  getInventoryItemByLocationAndSku(params: GetInventoryItemBySkuAndLocationParams): Promise<InventoryItemEntity>;
  listInventoryItems(params: ListInventoryItemsParams): Promise<ListInventoryItemsResponse>;
}

const FIELD_MAP = {
  storeLocationId: {
    path: 'storeLocation.id',
    keyword: true
  },
  skus: {
    path: 'sku',
    keyword: true
  }
};

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class InventoryItemsQueryImplementation extends InventoryItemsResolver implements InventoryItemsQuery {
  /**
   * Returns a single InventoryItem entry from the database.
   * @param id
   */
  async getInventoryItem({ id }: GetInventoryItemParams) {
    // Query the database and return the entry. If entry was not found, an error is thrown.
    const { Item: inventoryItem } = await InventoryItem.get({ PK: this.getPK(), SK: id });
    if (!inventoryItem) {
      throw new Error(`InventoryItem "${id}" not found.`);
    }

    return inventoryItem;
  }

  async getInventoryItemByLocationAndSku({
    locationId,
    sku
  }: GetInventoryItemBySkuAndLocationParams): Promise<InventoryItemEntity> {
    const PK = this.getPK();

    const { Items } = await InventoryItem.query(PK, {
      eq: getGSI1SK(locationId, sku),
      index: 'GSI1'
    });

    return Items && Items.length > 0 ? Items[0] : null;
  }

  /**
   * List multiple InventoryItem entries from the database.
   * Supports basic sorting and cursor-based pagination.
   * @param limit
   * @param sort
   * @param after
   * @param before
   */
  async listInventoryItems({ limit = 10, sort, after, search, where, before }: ListInventoryItemsParams) {
    let response: ElasticsearchSearchResponse<InventoryItemEntity>;

    try {
      const searchBody: { size: number; query: any; sort: any[]; search_after: string | null } = {
        size: limit + 1,
        query: {
          bool: {
            filter: [],
            must: []
          }
        },
        sort: [
          {
            'sku.keyword': 'asc'
          }
        ],
        search_after: decodeCursor(after) as any
      };

      if (search) {
        searchBody.query.bool.must.push({
          multi_match: {
            query: search,
            fields: ['sku', 'productName']
          }
        });

        searchBody.sort.unshift('_score');
      }

      for (const key in where || []) {
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

      if (where?.stockStatus) {
        if (where?.stockStatus === 'OUT_OF_STOCK') {
          searchBody.query.bool.filter.push({
            range: {
              sellableQuantity: {
                gte: 0,
                lte: 0
              }
            }
          });
        } else if (where?.stockStatus === 'IN_STOCK') {
          searchBody.query.bool.filter.push({
            range: {
              sellableQuantity: {
                gt: 0
              }
            }
          });
        }
      }

      response = await this.context.elasticsearch.search({
        index: 'root-inventory-item',
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
