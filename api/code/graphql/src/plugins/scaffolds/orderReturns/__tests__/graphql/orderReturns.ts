/**
 * Contains all of the GraphQL queries and mutations that we might need while writing our tests.
 * If needed, feel free to add more.
 */

export const GET_ORDER_RETURN = /* GraphQL */ `
  query GetOrderReturn($id: ID!) {
    orderReturns {
      getOrderReturn(id: $id) {
        id
        title
        description
      }
    }
  }
`;

export const CREATE_ORDER_RETURN = /* GraphQL */ `
  mutation CreateOrderReturn($data: OrderReturnCreateInput!) {
    orderReturns {
      createOrderReturn(data: $data) {
        id
        title
        description
      }
    }
  }
`;

export const UPDATE_ORDER_RETURN = /* GraphQL*/ `
    mutation UpdateOrderReturn($id: ID!, $data: OrderReturnUpdateInput!) {
        orderReturns {
            updateOrderReturn(id: $id, data: $data) {
                id
                title
                description
            }
        }
    }
`;

export const DELETE_ORDER_RETURN = /* GraphQL */ `
  mutation DeleteOrderReturn($id: ID!) {
    orderReturns {
      deleteOrderReturn(id: $id) {
        id
        title
        description
      }
    }
  }
`;

export const LIST_ORDER_RETURNS = /* GraphQL */ `
  query ListOrderReturns($sort: OrderReturnsListSort, $limit: Int, $after: String) {
    orderReturns {
      listOrderReturns(sort: $sort, limit: $limit, after: $after) {
        data {
          id
          title
          description
        }
        meta {
          limit
          after
          before
        }
      }
    }
  }
`;
