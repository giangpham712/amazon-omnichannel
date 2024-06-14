import { GET_ORDER, CREATE_ORDER, DELETE_ORDER, LIST_ORDERS, UPDATE_ORDER } from './graphql/orders';
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

let testOrders: any[] = [];

describe('Orders CRUD tests (end-to-end)', () => {
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
        }).then((response: any) => response.orders.createOrder)
      );
    }
  });

  afterEach(async () => {
    for (let i = 0; i < 3; i++) {
      try {
        await query({
          query: DELETE_ORDER,
          variables: {
            id: testOrders[i].id
          }
        });
      } catch {
        // Some of the entries might've been deleted during runtime.
        // We can ignore thrown errors.
      }
    }
    testOrders = [];
  });

  it('should be able to perform basic CRUD operations', async () => {
    // 1. Now that we have orders created, let's see if they come up in a basic listOrders query.
    const [order0, order1, order2] = testOrders;

    await query({
      query: LIST_ORDERS,
      variables: { limit: 3 }
    }).then((response: any) =>
      expect(response.orders.listOrders).toMatchObject({
        data: [order2, order1, order0],
        meta: {
          limit: 3
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
      query: LIST_ORDERS,
      variables: {
        limit: 2
      }
    }).then((response: any) =>
      expect(response.orders.listOrders).toMatchObject({
        data: [order2, order0],
        meta: {
          limit: 2
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
      expect(response.orders.updateOrder).toEqual({
        id: order0.id,
        title: 'Order 0 - UPDATED',
        description: `Order 0's description - UPDATED.`
      })
    );

    // 4. Get order 0 after the update.
    await query({
      query: GET_ORDER,
      variables: {
        id: order0.id
      }
    }).then((response: any) =>
      expect(response.orders.getOrder).toEqual({
        id: order0.id,
        title: 'Order 0 - UPDATED',
        description: `Order 0's description - UPDATED.`
      })
    );
  });
});
