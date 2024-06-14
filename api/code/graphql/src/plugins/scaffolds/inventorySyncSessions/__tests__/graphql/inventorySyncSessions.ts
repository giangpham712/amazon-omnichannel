/**
 * Contains all of the GraphQL queries and mutations that we might need while writing our tests.
 * If needed, feel free to add more.
 */

export const GET_INVENTORY_SYNC_SESSION = /* GraphQL */ `
  query GetInventorySyncSession($id: ID!) {
    inventorySyncSessions {
      getInventorySyncSession(id: $id) {
        id
        title
        description
      }
    }
  }
`;

export const CREATE_INVENTORY_SYNC_SESSION = /* GraphQL */ `
  mutation CreateInventorySyncSession($data: InventorySyncSessionCreateInput!) {
    inventorySyncSessions {
      createInventorySyncSession(data: $data) {
        id
        title
        description
      }
    }
  }
`;

export const UPDATE_INVENTORY_SYNC_SESSION = /* GraphQL*/ `
    mutation UpdateInventorySyncSession($id: ID!, $data: InventorySyncSessionUpdateInput!) {
        inventorySyncSessions {
            updateInventorySyncSession(id: $id, data: $data) {
                id
                title
                description
            }
        }
    }
`;

export const DELETE_INVENTORY_SYNC_SESSION = /* GraphQL */ `
  mutation DeleteInventorySyncSession($id: ID!) {
    inventorySyncSessions {
      deleteInventorySyncSession(id: $id) {
        id
        title
        description
      }
    }
  }
`;

export const LIST_INVENTORY_SYNC_SESSIONS = /* GraphQL */ `
  query ListInventorySyncSessions($sort: InventorySyncSessionsListSort, $limit: Int, $after: String) {
    inventorySyncSessions {
      listInventorySyncSessions(sort: $sort, limit: $limit, after: $after) {
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
