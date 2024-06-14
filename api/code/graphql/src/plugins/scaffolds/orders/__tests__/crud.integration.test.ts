import { handler } from '~/index';
import { GET_ORDER, CREATE_ORDER, DELETE_ORDER, LIST_ORDERS, UPDATE_ORDER } from './graphql/orders';

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

let testOrders: any[] = [];

describe('Orders CRUD tests (integration)', () => {
  beforeEach(async () => {
    for (let i = 0; i < 3; i++) {
      testOrders.push(
        await query({
          query: CREATE_ORDER,
          variables: {
            data: {
              title: `Order ${i}`,
              description: `Order ${i}'s description.`
            }
          }
        }).then((response: any) => response.data.orders.createOrder)
      );
    }
  });

  afterEach(async () => {
    for (let i = 0; i < 3; i++) {
      await query({
        query: DELETE_ORDER,
        variables: {
          id: testOrders[i].id
        }
      });
    }
    testOrders = [];
  });

  it('should be able to perform basic CRUD operations', async () => {
    // 1. Now that we have orders created, let's see if they come up in a basic listOrders query.
    const [order0, order1, order2] = testOrders;

    await query({ query: LIST_ORDERS }).then((response: any) =>
      expect(response.data.orders.listOrders).toEqual({
        data: [order2, order1, order0],
        meta: {
          after: null,
          before: null,
          limit: 10
        }
      })
    );

    // 2. Delete order 1.
    await query({
      query: DELETE_ORDER,
      variables: {
        id: order1.id
      }
    });

    await query({
      query: LIST_ORDERS
    }).then((response: any) =>
      expect(response.data.orders.listOrders).toEqual({
        data: [order2, order0],
        meta: {
          after: null,
          before: null,
          limit: 10
        }
      })
    );

    // 3. Update order 0.
    await query({
      query: UPDATE_ORDER,
      variables: {
        id: order0.id,
        data: {
          title: 'Order 0 - UPDATED',
          description: `Order 0's description - UPDATED.`
        }
      }
    }).then((response: any) =>
      expect(response.data.orders.updateOrder).toEqual({
        id: order0.id,
        title: 'Order 0 - UPDATED',
        description: `Order 0's description - UPDATED.`
      })
    );

    // 5. Get order 0 after the update.
    await query({
      query: GET_ORDER,
      variables: { id: order0.id }
    }).then((response: any) =>
      expect(response.data.orders.getOrder).toEqual({
        id: order0.id,
        title: 'Order 0 - UPDATED',
        description: `Order 0's description - UPDATED.`
      })
    );
  });

  test('should be able to use cursor-based pagination (desc)', async () => {
    const [order0, order1, order2] = testOrders;

    await query({
      query: LIST_ORDERS,
      variables: {
        limit: 2
      }
    }).then((response: any) =>
      expect(response.data.orders.listOrders).toEqual({
        data: [order2, order1],
        meta: {
          after: order1.id,
          before: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_ORDERS,
      variables: {
        limit: 2,
        after: order1.id
      }
    }).then((response: any) =>
      expect(response.data.orders.listOrders).toEqual({
        data: [order0],
        meta: {
          before: order0.id,
          after: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_ORDERS,
      variables: {
        limit: 2,
        before: order0.id
      }
    }).then((response: any) =>
      expect(response.data.orders.listOrders).toEqual({
        data: [order2, order1],
        meta: {
          after: order1.id,
          before: null,
          limit: 2
        }
      })
    );
  });

  test('should be able to use cursor-based pagination (ascending)', async () => {
    const [order0, order1, order2] = testOrders;

    await query({
      query: LIST_ORDERS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC'
      }
    }).then((response: any) =>
      expect(response.data.orders.listOrders).toEqual({
        data: [order0, order1],
        meta: {
          after: order1.id,
          before: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_ORDERS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC',
        after: order1.id
      }
    }).then((response: any) =>
      expect(response.data.orders.listOrders).toEqual({
        data: [order2],
        meta: {
          before: order2.id,
          after: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_ORDERS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC',
        before: order2.id
      }
    }).then((response: any) =>
      expect(response.data.orders.listOrders).toEqual({
        data: [order0, order1],
        meta: {
          after: order1.id,
          before: null,
          limit: 2
        }
      })
    );
  });
});
