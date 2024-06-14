import { handler } from '~/index';
import {
  GET_INVENTORY_ITEM,
  CREATE_INVENTORY_ITEM,
  DELETE_INVENTORY_ITEM,
  LIST_INVENTORY_ITEMS,
  UPDATE_INVENTORY_ITEM
} from './graphql/inventoryItems';

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

let testInventoryItems: any[] = [];

describe('InventoryItems CRUD tests (integration)', () => {
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
        }).then((response: any) => response.data.inventoryItems.createInventoryItem)
      );
    }
  });

  afterEach(async () => {
    for (let i = 0; i < 3; i++) {
      await query({
        query: DELETE_INVENTORY_ITEM,
        variables: {
          id: testInventoryItems[i].id
        }
      });
    }
    testInventoryItems = [];
  });

  it('should be able to perform basic CRUD operations', async () => {
    // 1. Now that we have inventoryItems created, let's see if they come up in a basic listInventoryItems query.
    const [inventoryItem0, inventoryItem1, inventoryItem2] = testInventoryItems;

    await query({ query: LIST_INVENTORY_ITEMS }).then((response: any) =>
      expect(response.data.inventoryItems.listInventoryItems).toEqual({
        data: [inventoryItem2, inventoryItem1, inventoryItem0],
        meta: {
          after: null,
          before: null,
          limit: 10
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
      query: LIST_INVENTORY_ITEMS
    }).then((response: any) =>
      expect(response.data.inventoryItems.listInventoryItems).toEqual({
        data: [inventoryItem2, inventoryItem0],
        meta: {
          after: null,
          before: null,
          limit: 10
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
      expect(response.data.inventoryItems.updateInventoryItem).toEqual({
        id: inventoryItem0.id,
        title: 'InventoryItem 0 - UPDATED',
        description: `InventoryItem 0's description - UPDATED.`
      })
    );

    // 5. Get inventoryItem 0 after the update.
    await query({
      query: GET_INVENTORY_ITEM,
      variables: { id: inventoryItem0.id }
    }).then((response: any) =>
      expect(response.data.inventoryItems.getInventoryItem).toEqual({
        id: inventoryItem0.id,
        title: 'InventoryItem 0 - UPDATED',
        description: `InventoryItem 0's description - UPDATED.`
      })
    );
  });

  test('should be able to use cursor-based pagination (desc)', async () => {
    const [inventoryItem0, inventoryItem1, inventoryItem2] = testInventoryItems;

    await query({
      query: LIST_INVENTORY_ITEMS,
      variables: {
        limit: 2
      }
    }).then((response: any) =>
      expect(response.data.inventoryItems.listInventoryItems).toEqual({
        data: [inventoryItem2, inventoryItem1],
        meta: {
          after: inventoryItem1.id,
          before: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_INVENTORY_ITEMS,
      variables: {
        limit: 2,
        after: inventoryItem1.id
      }
    }).then((response: any) =>
      expect(response.data.inventoryItems.listInventoryItems).toEqual({
        data: [inventoryItem0],
        meta: {
          before: inventoryItem0.id,
          after: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_INVENTORY_ITEMS,
      variables: {
        limit: 2,
        before: inventoryItem0.id
      }
    }).then((response: any) =>
      expect(response.data.inventoryItems.listInventoryItems).toEqual({
        data: [inventoryItem2, inventoryItem1],
        meta: {
          after: inventoryItem1.id,
          before: null,
          limit: 2
        }
      })
    );
  });

  test('should be able to use cursor-based pagination (ascending)', async () => {
    const [inventoryItem0, inventoryItem1, inventoryItem2] = testInventoryItems;

    await query({
      query: LIST_INVENTORY_ITEMS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC'
      }
    }).then((response: any) =>
      expect(response.data.inventoryItems.listInventoryItems).toEqual({
        data: [inventoryItem0, inventoryItem1],
        meta: {
          after: inventoryItem1.id,
          before: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_INVENTORY_ITEMS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC',
        after: inventoryItem1.id
      }
    }).then((response: any) =>
      expect(response.data.inventoryItems.listInventoryItems).toEqual({
        data: [inventoryItem2],
        meta: {
          before: inventoryItem2.id,
          after: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_INVENTORY_ITEMS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC',
        before: inventoryItem2.id
      }
    }).then((response: any) =>
      expect(response.data.inventoryItems.listInventoryItems).toEqual({
        data: [inventoryItem0, inventoryItem1],
        meta: {
          after: inventoryItem1.id,
          before: null,
          limit: 2
        }
      })
    );
  });
});
