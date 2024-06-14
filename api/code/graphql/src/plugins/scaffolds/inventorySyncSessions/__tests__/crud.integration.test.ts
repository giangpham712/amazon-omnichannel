import { handler } from '~/index';
import {
  GET_INVENTORY_SYNC_SESSION,
  CREATE_INVENTORY_SYNC_SESSION,
  DELETE_INVENTORY_SYNC_SESSION,
  LIST_INVENTORY_SYNC_SESSIONS,
  UPDATE_INVENTORY_SYNC_SESSION
} from './graphql/inventorySyncSessions';

/**
 * An example of an integration test. You can use these to test your GraphQL resolvers, for example,
 * ensure they are correctly interacting with the database and other cloud infrastructure resources
 * and services. These tests provide a good level of confidence that our application is working, and
 * can be reasonably fast to complete.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#crudintegrationtestts
 */

const query = ({ query = '', variables = {} } = {}) => {
  return handler({
    httpMethod: 'POST',
    headers: {},
    body: JSON.stringify({
      query,
      variables
    })
  }).then((response: any) => JSON.parse(response.body));
};

let testInventorySyncSessions: any[] = [];

describe('InventorySyncSessions CRUD tests (integration)', () => {
  beforeEach(async () => {
    for (let i = 0; i < 3; i++) {
      testInventorySyncSessions.push(
        await query({
          query: CREATE_INVENTORY_SYNC_SESSION,
          variables: {
            data: {
              title: `InventorySyncSession ${i}`,
              description: `InventorySyncSession ${i}'s description.`
            }
          }
        }).then((response: any) => response.data.inventorySyncSessions.createInventorySyncSession)
      );
    }
  });

  afterEach(async () => {
    for (let i = 0; i < 3; i++) {
      await query({
        query: DELETE_INVENTORY_SYNC_SESSION,
        variables: {
          id: testInventorySyncSessions[i].id
        }
      });
    }
    testInventorySyncSessions = [];
  });

  it('should be able to perform basic CRUD operations', async () => {
    // 1. Now that we have inventorySyncSessions created, let's see if they come up in a basic listInventorySyncSessions query.
    const [inventorySyncSession0, inventorySyncSession1, inventorySyncSession2] = testInventorySyncSessions;

    await query({ query: LIST_INVENTORY_SYNC_SESSIONS }).then((response: any) =>
      expect(response.data.inventorySyncSessions.listInventorySyncSessions).toEqual({
        data: [inventorySyncSession2, inventorySyncSession1, inventorySyncSession0],
        meta: {
          after: null,
          before: null,
          limit: 10
        }
      })
    );

    // 2. Delete inventorySyncSession 1.
    await query({
      query: DELETE_INVENTORY_SYNC_SESSION,
      variables: {
        id: inventorySyncSession1.id
      }
    });

    await query({
      query: LIST_INVENTORY_SYNC_SESSIONS
    }).then((response: any) =>
      expect(response.data.inventorySyncSessions.listInventorySyncSessions).toEqual({
        data: [inventorySyncSession2, inventorySyncSession0],
        meta: {
          after: null,
          before: null,
          limit: 10
        }
      })
    );

    // 3. Update inventorySyncSession 0.
    await query({
      query: UPDATE_INVENTORY_SYNC_SESSION,
      variables: {
        id: inventorySyncSession0.id,
        data: {
          title: 'InventorySyncSession 0 - UPDATED',
          description: `InventorySyncSession 0's description - UPDATED.`
        }
      }
    }).then((response: any) =>
      expect(response.data.inventorySyncSessions.updateInventorySyncSession).toEqual({
        id: inventorySyncSession0.id,
        title: 'InventorySyncSession 0 - UPDATED',
        description: `InventorySyncSession 0's description - UPDATED.`
      })
    );

    // 5. Get inventorySyncSession 0 after the update.
    await query({
      query: GET_INVENTORY_SYNC_SESSION,
      variables: { id: inventorySyncSession0.id }
    }).then((response: any) =>
      expect(response.data.inventorySyncSessions.getInventorySyncSession).toEqual({
        id: inventorySyncSession0.id,
        title: 'InventorySyncSession 0 - UPDATED',
        description: `InventorySyncSession 0's description - UPDATED.`
      })
    );
  });

  test('should be able to use cursor-based pagination (desc)', async () => {
    const [inventorySyncSession0, inventorySyncSession1, inventorySyncSession2] = testInventorySyncSessions;

    await query({
      query: LIST_INVENTORY_SYNC_SESSIONS,
      variables: {
        limit: 2
      }
    }).then((response: any) =>
      expect(response.data.inventorySyncSessions.listInventorySyncSessions).toEqual({
        data: [inventorySyncSession2, inventorySyncSession1],
        meta: {
          after: inventorySyncSession1.id,
          before: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_INVENTORY_SYNC_SESSIONS,
      variables: {
        limit: 2,
        after: inventorySyncSession1.id
      }
    }).then((response: any) =>
      expect(response.data.inventorySyncSessions.listInventorySyncSessions).toEqual({
        data: [inventorySyncSession0],
        meta: {
          before: inventorySyncSession0.id,
          after: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_INVENTORY_SYNC_SESSIONS,
      variables: {
        limit: 2,
        before: inventorySyncSession0.id
      }
    }).then((response: any) =>
      expect(response.data.inventorySyncSessions.listInventorySyncSessions).toEqual({
        data: [inventorySyncSession2, inventorySyncSession1],
        meta: {
          after: inventorySyncSession1.id,
          before: null,
          limit: 2
        }
      })
    );
  });

  test('should be able to use cursor-based pagination (ascending)', async () => {
    const [inventorySyncSession0, inventorySyncSession1, inventorySyncSession2] = testInventorySyncSessions;

    await query({
      query: LIST_INVENTORY_SYNC_SESSIONS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC'
      }
    }).then((response: any) =>
      expect(response.data.inventorySyncSessions.listInventorySyncSessions).toEqual({
        data: [inventorySyncSession0, inventorySyncSession1],
        meta: {
          after: inventorySyncSession1.id,
          before: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_INVENTORY_SYNC_SESSIONS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC',
        after: inventorySyncSession1.id
      }
    }).then((response: any) =>
      expect(response.data.inventorySyncSessions.listInventorySyncSessions).toEqual({
        data: [inventorySyncSession2],
        meta: {
          before: inventorySyncSession2.id,
          after: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_INVENTORY_SYNC_SESSIONS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC',
        before: inventorySyncSession2.id
      }
    }).then((response: any) =>
      expect(response.data.inventorySyncSessions.listInventorySyncSessions).toEqual({
        data: [inventorySyncSession0, inventorySyncSession1],
        meta: {
          after: inventorySyncSession1.id,
          before: null,
          limit: 2
        }
      })
    );
  });
});
