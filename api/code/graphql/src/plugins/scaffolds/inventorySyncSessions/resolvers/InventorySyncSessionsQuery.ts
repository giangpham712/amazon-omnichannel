import { InventorySyncSessionEntity, InventorySyncSession } from '@purity/core/inventorySyncSessions'
import InventorySyncSessionsResolver from './InventorySyncSessionsResolver';

/**
 * Contains base `getInventorySyncSession` and `listInventorySyncSessions` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement security-related checks.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */

interface GetInventorySyncSessionParams {
  id: string;
}

interface ListInventorySyncSessionsParams {
  sort?: 'createdOn_ASC' | 'createdOn_DESC';
  limit?: number;
  after?: string;
  before?: string;
}

interface ListInventorySyncSessionsResponse {
  data: InventorySyncSessionEntity[];
  meta: { limit: number; after: string | null; before: string | null };
}

interface InventorySyncSessionsQuery {
  getInventorySyncSession(params: GetInventorySyncSessionParams): Promise<InventorySyncSessionEntity>;
  listInventorySyncSessions(params: ListInventorySyncSessionsParams): Promise<ListInventorySyncSessionsResponse>;
}

interface InventorySyncSessionsQueryParams {
  limit?: number;
  reverse?: boolean;
  gt?: string | number;
  lt?: string | number;
}

interface InventorySyncSessionsMetaParams {
  limit: number;
  after: string | null;
  before: string | null;
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class InventorySyncSessionsQueryImplementation
  extends InventorySyncSessionsResolver
  implements InventorySyncSessionsQuery
{
  /**
   * Returns a single InventorySyncSession entry from the database.
   * @param id
   */
  async getInventorySyncSession({ id }: GetInventorySyncSessionParams) {
    // Query the database and return the entry. If entry was not found, an error is thrown.
    const { Item: inventorySyncSession } = await InventorySyncSession.get({ PK: this.getPK(), SK: id });
    if (!inventorySyncSession) {
      throw new Error(`InventorySyncSession "${id}" not found.`);
    }

    return inventorySyncSession;
  }

  /**
   * List multiple InventorySyncSession entries from the database.
   * Supports basic sorting and cursor-based pagination.
   * @param limit
   * @param sort
   * @param after
   * @param before
   */
  async listInventorySyncSessions({ limit = 10, sort, after, before }: ListInventorySyncSessionsParams) {
    const PK = this.getPK();
    const query: InventorySyncSessionsQueryParams = {
      limit,
      reverse: sort !== 'createdOn_ASC',
      gt: undefined,
      lt: undefined
    };
    const meta: InventorySyncSessionsMetaParams = { limit, after: null, before: null };

    // The query is constructed differently, depending on the "before" or "after" values.
    if (before) {
      query.reverse = !query.reverse;
      if (query.reverse) {
        query.lt = before;
      } else {
        query.gt = before;
      }

      const { Items } = await InventorySyncSession.query(PK, { ...query, limit: limit + 1 });

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

    const { Items } = await InventorySyncSession.query(PK, { ...query, limit: limit + 1 });

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
