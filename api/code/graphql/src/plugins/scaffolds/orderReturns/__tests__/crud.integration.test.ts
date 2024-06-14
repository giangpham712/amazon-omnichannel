import { handler } from '~/index';
import {
  GET_ORDER_RETURN,
  CREATE_ORDER_RETURN,
  DELETE_ORDER_RETURN,
  LIST_ORDER_RETURNS,
  UPDATE_ORDER_RETURN
} from './graphql/orderReturns';

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

let testOrderReturns: any[] = [];

describe('OrderReturns CRUD tests (integration)', () => {
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
        }).then((response: any) => response.data.orderReturns.createOrderReturn)
      );
    }
  });

  afterEach(async () => {
    for (let i = 0; i < 3; i++) {
      await query({
        query: DELETE_ORDER_RETURN,
        variables: {
          id: testOrderReturns[i].id
        }
      });
    }
    testOrderReturns = [];
  });

  it('should be able to perform basic CRUD operations', async () => {
    // 1. Now that we have orderReturns created, let's see if they come up in a basic listOrderReturns query.
    const [orderReturn0, orderReturn1, orderReturn2] = testOrderReturns;

    await query({ query: LIST_ORDER_RETURNS }).then((response: any) =>
      expect(response.data.orderReturns.listOrderReturns).toEqual({
        data: [orderReturn2, orderReturn1, orderReturn0],
        meta: {
          after: null,
          before: null,
          limit: 10
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
      query: LIST_ORDER_RETURNS
    }).then((response: any) =>
      expect(response.data.orderReturns.listOrderReturns).toEqual({
        data: [orderReturn2, orderReturn0],
        meta: {
          after: null,
          before: null,
          limit: 10
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
      expect(response.data.orderReturns.updateOrderReturn).toEqual({
        id: orderReturn0.id,
        title: 'OrderReturn 0 - UPDATED',
        description: `OrderReturn 0's description - UPDATED.`
      })
    );

    // 5. Get orderReturn 0 after the update.
    await query({
      query: GET_ORDER_RETURN,
      variables: { id: orderReturn0.id }
    }).then((response: any) =>
      expect(response.data.orderReturns.getOrderReturn).toEqual({
        id: orderReturn0.id,
        title: 'OrderReturn 0 - UPDATED',
        description: `OrderReturn 0's description - UPDATED.`
      })
    );
  });

  test('should be able to use cursor-based pagination (desc)', async () => {
    const [orderReturn0, orderReturn1, orderReturn2] = testOrderReturns;

    await query({
      query: LIST_ORDER_RETURNS,
      variables: {
        limit: 2
      }
    }).then((response: any) =>
      expect(response.data.orderReturns.listOrderReturns).toEqual({
        data: [orderReturn2, orderReturn1],
        meta: {
          after: orderReturn1.id,
          before: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_ORDER_RETURNS,
      variables: {
        limit: 2,
        after: orderReturn1.id
      }
    }).then((response: any) =>
      expect(response.data.orderReturns.listOrderReturns).toEqual({
        data: [orderReturn0],
        meta: {
          before: orderReturn0.id,
          after: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_ORDER_RETURNS,
      variables: {
        limit: 2,
        before: orderReturn0.id
      }
    }).then((response: any) =>
      expect(response.data.orderReturns.listOrderReturns).toEqual({
        data: [orderReturn2, orderReturn1],
        meta: {
          after: orderReturn1.id,
          before: null,
          limit: 2
        }
      })
    );
  });

  test('should be able to use cursor-based pagination (ascending)', async () => {
    const [orderReturn0, orderReturn1, orderReturn2] = testOrderReturns;

    await query({
      query: LIST_ORDER_RETURNS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC'
      }
    }).then((response: any) =>
      expect(response.data.orderReturns.listOrderReturns).toEqual({
        data: [orderReturn0, orderReturn1],
        meta: {
          after: orderReturn1.id,
          before: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_ORDER_RETURNS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC',
        after: orderReturn1.id
      }
    }).then((response: any) =>
      expect(response.data.orderReturns.listOrderReturns).toEqual({
        data: [orderReturn2],
        meta: {
          before: orderReturn2.id,
          after: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_ORDER_RETURNS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC',
        before: orderReturn2.id
      }
    }).then((response: any) =>
      expect(response.data.orderReturns.listOrderReturns).toEqual({
        data: [orderReturn0, orderReturn1],
        meta: {
          after: orderReturn1.id,
          before: null,
          limit: 2
        }
      })
    );
  });
});
