import {
  GET_INVENTORY_ITEM,
  CREATE_INVENTORY_ITEM,
  DELETE_INVENTORY_ITEM,
  LIST_INVENTORY_ITEMS,
  UPDATE_INVENTORY_ITEM
} from './graphql/inventoryItems';
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

let testInventoryItems: any[] = [];

describe('InventoryItems CRUD tests (end-to-end)', () => {
  beforeEach(async () => {
    for (let i = 0; i < 3; i++) {
      testInventoryItems.push(
        await query({
          query: CREATE_INVENTORY_ITEM,
          variables: {
            data: {
              title: `InventoryItem ${i}`,
              description: `InventoryItem ${i}'s description.`
            }
          }
        }).then((response: any) => response.inventoryItems.createInventoryItem)
      );
    }
  });

  afterEach(async () => {
    for (let i = 0; i < 3; i++) {
      try {
        await query({
          query: DELETE_INVENTORY_ITEM,
          variables: {
            id: testInventoryItems[i].id
          }
        });
      } catch {
        // Some of the entries might've been deleted during runtime.
        // We can ignore thrown errors.
      }
    }
    testInventoryItems = [];
  });

  it('should be able to perform basic CRUD operations', async () => {
    // 1. Now that we have inventoryItems created, let's see if they come up in a basic listInventoryItems query.
    const [inventoryItem0, inventoryItem1, inventoryItem2] = testInventoryItems;

    await query({
      query: LIST_INVENTORY_ITEMS,
      variables: { limit: 3 }
    }).then((response: any) =>
      expect(response.inventoryItems.listInventoryItems).toMatchObject({
        data: [inventoryItem2, inventoryItem1, inventoryItem0],
        meta: {
          limit: 3
        }
      })
    );

    // 2. Delete inventoryItem 1.
    await query({
      query: DELETE_INVENTORY_ITEM,
      variables: {
        id: inventoryItem1.id
      }
    });

    await query({
      query: LIST_INVENTORY_ITEMS,
      variables: {
        limit: 2
      }
    }).then((response: any) =>
      expect(response.inventoryItems.listInventoryItems).toMatchObject({
        data: [inventoryItem2, inventoryItem0],
        meta: {
          limit: 2
        }
      })
    );

    // 3. Update inventoryItem 0.
    await query({
      query: UPDATE_INVENTORY_ITEM,
      variables: {
        id: inventoryItem0.id,
        data: {
          title: 'InventoryItem 0 - UPDATED',
          description: `InventoryItem 0's description - UPDATED.`
        }
      }
    }).then((response: any) =>
      expect(response.inventoryItems.updateInventoryItem).toEqual({
        id: inventoryItem0.id,
        title: 'InventoryItem 0 - UPDATED',
        description: `InventoryItem 0's description - UPDATED.`
      })
    );

    // 4. Get inventoryItem 0 after the update.
    await query({
      query: GET_INVENTORY_ITEM,
      variables: {
        id: inventoryItem0.id
      }
    }).then((response: any) =>
      expect(response.inventoryItems.getInventoryItem).toEqual({
        id: inventoryItem0.id,
        title: 'InventoryItem 0 - UPDATED',
        description: `InventoryItem 0's description - UPDATED.`
      })
    );
  });
});
