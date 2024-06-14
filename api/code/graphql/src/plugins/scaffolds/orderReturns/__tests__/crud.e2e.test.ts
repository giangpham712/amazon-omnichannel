import {
  GET_ORDER_RETURN,
  CREATE_ORDER_RETURN,
  DELETE_ORDER_RETURN,
  LIST_ORDER_RETURNS,
  UPDATE_ORDER_RETURN
} from './graphql/orderReturns';
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

let testOrderReturns: any[] = [];

describe('OrderReturns CRUD tests (end-to-end)', () => {
  beforeEach(async () => {
    for (let i = 0; i < 3; i++) {
      testOrderReturns.push(
        await query({
          query: CREATE_ORDER_RETURN,
          variables: {
            data: {
              title: `OrderReturn ${i}`,
              description: `OrderReturn ${i}'s description.`
            }
          }
        }).then((response: any) => response.orderReturns.createOrderReturn)
      );
    }
  });

  afterEach(async () => {
    for (let i = 0; i < 3; i++) {
      try {
        await query({
          query: DELETE_ORDER_RETURN,
          variables: {
            id: testOrderReturns[i].id
          }
        });
      } catch {
        // Some of the entries might've been deleted during runtime.
        // We can ignore thrown errors.
      }
    }
    testOrderReturns = [];
  });

  it('should be able to perform basic CRUD operations', async () => {
    // 1. Now that we have orderReturns created, let's see if they come up in a basic listOrderReturns query.
    const [orderReturn0, orderReturn1, orderReturn2] = testOrderReturns;

    await query({
      query: LIST_ORDER_RETURNS,
      variables: { limit: 3 }
    }).then((response: any) =>
      expect(response.orderReturns.listOrderReturns).toMatchObject({
        data: [orderReturn2, orderReturn1, orderReturn0],
        meta: {
          limit: 3
        }
      })
    );

    // 2. Delete orderReturn 1.
    await query({
      query: DELETE_ORDER_RETURN,
      variables: {
        id: orderReturn1.id
      }
    });

    await query({
      query: LIST_ORDER_RETURNS,
      variables: {
        limit: 2
      }
    }).then((response: any) =>
      expect(response.orderReturns.listOrderReturns).toMatchObject({
        data: [orderReturn2, orderReturn0],
        meta: {
          limit: 2
        }
      })
    );

    // 3. Update orderReturn 0.
    await query({
      query: UPDATE_ORDER_RETURN,
      variables: {
        id: orderReturn0.id,
        data: {
          title: 'OrderReturn 0 - UPDATED',
          description: `OrderReturn 0's description - UPDATED.`
        }
      }
    }).then((response: any) =>
      expect(response.orderReturns.updateOrderReturn).toEqual({
        id: orderReturn0.id,
        title: 'OrderReturn 0 - UPDATED',
        description: `OrderReturn 0's description - UPDATED.`
      })
    );

    // 4. Get orderReturn 0 after the update.
    await query({
      query: GET_ORDER_RETURN,
      variables: {
        id: orderReturn0.id
      }
    }).then((response: any) =>
      expect(response.orderReturns.getOrderReturn).toEqual({
        id: orderReturn0.id,
        title: 'OrderReturn 0 - UPDATED',
        description: `OrderReturn 0's description - UPDATED.`
      })
    );
  });
});
