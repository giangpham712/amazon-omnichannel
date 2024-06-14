import { queryOne } from '@webiny/db-dynamodb/utils/query';
import { StoreLocationEntity } from '@purity/core/storeLocations/types';
import StoreLocation from '@purity/core/storeLocations/entities';
import StoreLocationsResolver from './StoreLocationsResolver';

/**
 * Contains base `getStoreLocation` and `listStoreLocations` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement security-related checks.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */

interface GetStoreLocationParams {
  id: string;
}

interface GetStoreLocationBySPSupplySourceParams {
  spSupplySourceId: string;
}

interface ListStoreLocationsParams {
  sort?: 'createdOn_ASC' | 'createdOn_DESC';
  limit?: number;
  after?: string;
  before?: string;
}

interface ListStoreLocationsResponse {
  data: StoreLocationEntity[];
  meta: { limit: number; after: string | null; before: string | null };
}

interface StoreLocationsQuery {
  getStoreLocation(params: GetStoreLocationParams): Promise<StoreLocationEntity>;
  getStoreLocationBySPSupplySource(params: GetStoreLocationBySPSupplySourceParams): Promise<StoreLocationEntity>;
  listStoreLocations(params: ListStoreLocationsParams): Promise<ListStoreLocationsResponse>;
}

interface StoreLocationsQueryParams {
  limit?: number;
  reverse?: boolean;
  gt?: string | number;
  lt?: string | number;
}

interface StoreLocationsMetaParams {
  limit: number;
  after: string | null;
  before: string | null;
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class StoreLocationsQueryImplementation extends StoreLocationsResolver implements StoreLocationsQuery {
  /**
   * Returns a single StoreLocation entry from the database.
   * @param id
   */
  async getStoreLocation({ id }: GetStoreLocationParams) {
    // Query the database and return the entry. If entry was not found, an error is thrown.
    const { Item: storeLocation } = await StoreLocation.get({ PK: this.getPK(), SK: id });
    if (!storeLocation) {
      throw new Error(`StoreLocation "${id}" not found.`);
    }

    return storeLocation;
  }

  async getStoreLocationBySPSupplySource({ spSupplySourceId }: GetStoreLocationBySPSupplySourceParams) {
    // Query the database and return the entry. If entry was not found, an error is thrown.
    const storeLocation = await queryOne<StoreLocationEntity>({
      entity: StoreLocation,
      partitionKey: this.getPK(),
      options: {
        index: 'GSI1',
        eq: spSupplySourceId
      }
    });

    if (!storeLocation) {
      throw new Error(`StoreLocation with SP Supply Source ID "${spSupplySourceId}" not found.`);
    }

    return storeLocation;
  }

  /**
   * List multiple StoreLocation entries from the database.
   * Supports basic sorting and cursor-based pagination.
   * @param limit
   * @param sort
   * @param after
   * @param before
   */
  async listStoreLocations({ limit = 10, sort, after, before }: ListStoreLocationsParams) {
    const PK = this.getPK();
    const query: StoreLocationsQueryParams = {
      limit,
      reverse: sort !== 'createdOn_ASC',
      gt: undefined,
      lt: undefined
    };
    const meta: StoreLocationsMetaParams = { limit, after: null, before: null };

    // The query is constructed differently, depending on the "before" or "after" values.
    if (before) {
      query.reverse = !query.reverse;
      if (query.reverse) {
        query.lt = before;
      } else {
        query.gt = before;
      }

      const { Items } = await StoreLocation.query(PK, { ...query, limit: limit + 1 });

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

    const { Items } = await StoreLocation.query(PK, { ...query, limit: limit + 1 });

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
}
