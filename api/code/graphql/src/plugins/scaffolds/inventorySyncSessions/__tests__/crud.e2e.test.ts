import {
  GET_INVENTORY_SYNC_SESSION,
  CREATE_INVENTORY_SYNC_SESSION,
  DELETE_INVENTORY_SYNC_SESSION,
  LIST_INVENTORY_SYNC_SESSIONS,
  UPDATE_INVENTORY_SYNC_SESSION
} from './graphql/inventorySyncSessions';
import { request } from 'graphql-request';

/**
 * An example of an end-to-end (E2E) test. You can use these to test if the overall cloud infrastructure
 * setup is working. That's why, here we're not executing the handler code directly, but issuing real
 * HTTP requests over to the deployed Amazon Cloudfront distribution. These tests provide the highest
 * level of confidence that our application is working, but they take more time in order to complete.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#crude2etestts
 */

const query = async ({ query = '', variables = {} } = {}) => {
  return request(process.env.API_URL + '/graphql', query, variables);
};

let testInventorySyncSessions: any[] = [];

describe('InventorySyncSessions CRUD tests (end-to-end)', () => {
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
        }).then((response: any) => response.inventorySyncSessions.createInventorySyncSession)
      );
    }
  });

  afterEach(async () => {
    for (let i = 0; i < 3; i++) {
      try {
        await query({
          query: DELETE_INVENTORY_SYNC_SESSION,
          variables: {
            id: testInventorySyncSessions[i].id
          }
        });
      } catch {
        // Some of the entries might've been deleted during runtime.
        // We can ignore thrown errors.
      }
    }
    testInventorySyncSessions = [];
  });

  it('should be able to perform basic CRUD operations', async () => {
    // 1. Now that we have inventorySyncSessions created, let's see if they come up in a basic listInventorySyncSessions query.
    const [inventorySyncSession0, inventorySyncSession1, inventorySyncSession2] = testInventorySyncSessions;

    await query({
      query: LIST_INVENTORY_SYNC_SESSIONS,
      variables: { limit: 3 }
    }).then((response: any) =>
      expect(response.inventorySyncSessions.listInventorySyncSessions).toMatchObject({
        data: [inventorySyncSession2, inventorySyncSession1, inventorySyncSession0],
        meta: {
          limit: 3
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
      query: LIST_INVENTORY_SYNC_SESSIONS,
      variables: {
        limit: 2
      }
    }).then((response: any) =>
      expect(response.inventorySyncSessions.listInventorySyncSessions).toMatchObject({
        data: [inventorySyncSession2, inventorySyncSession0],
        meta: {
          limit: 2
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
      expect(response.inventorySyncSessions.updateInventorySyncSession).toEqual({
        id: inventorySyncSession0.id,
        title: 'InventorySyncSession 0 - UPDATED',
        description: `InventorySyncSession 0's description - UPDATED.`
      })
    );

    // 4. Get inventorySyncSession 0 after the update.
    await query({
      query: GET_INVENTORY_SYNC_SESSION,
      variables: {
        id: inventorySyncSession0.id
      }
    }).then((response: any) =>
      expect(response.inventorySyncSessions.getInventorySyncSession).toEqual({
        id: inventorySyncSession0.id,
        title: 'InventorySyncSession 0 - UPDATED',
        description: `InventorySyncSession 0's description - UPDATED.`
      })
    );
  });
});
