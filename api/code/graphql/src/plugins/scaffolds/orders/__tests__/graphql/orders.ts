/**
 * Contains all of the GraphQL queries and mutations that we might need while writing our tests.
 * If needed, feel free to add more.
 */

export const GET_ORDER = /* GraphQL */ `
  query GetOrder($id: ID!) {
    orders {
      getOrder(id: $id) {
        id
        title
        description
      }
    }
  }
`;

export const CREATE_ORDER = /* GraphQL */ `
  mutation CreateOrder($data: OrderCreateInput!) {
    orders {
      createOrder(data: $data) {
        id
        title
        description
      }
    }
  }
`;

export const UPDATE_ORDER = /* GraphQL*/ `
    mutation UpdateOrder($id: ID!, $data: OrderUpdateInput!) {
        orders {
            updateOrder(id: $id, data: $data) {
                id
                title
                description
            }
        }
    }
`;

export const DELETE_ORDER = /* GraphQL */ `
  mutation DeleteOrder($id: ID!) {
    orders {
      deleteOrder(id: $id) {
        id
        title
        description
      }
    }
  }
`;

export const LIST_ORDERS = /* GraphQL */ `
  query ListOrders($sort: OrdersListSort, $limit: Int, $after: String) {
    orders {
      listOrders(sort: $sort, limit: $limit, after: $after) {
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
