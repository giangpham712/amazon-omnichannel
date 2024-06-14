/**
 * Contains all of the GraphQL queries and mutations that we might need while writing our tests.
 * If needed, feel free to add more.
 */

export const GET_INVENTORY_ITEM = /* GraphQL */ `
  query GetInventoryItem($id: ID!) {
    inventoryItems {
      getInventoryItem(id: $id) {
        id
        title
        description
      }
    }
  }
`;

export const CREATE_INVENTORY_ITEM = /* GraphQL */ `
  mutation CreateInventoryItem($data: InventoryItemCreateInput!) {
    inventoryItems {
      createInventoryItem(data: $data) {
        id
        title
        description
      }
    }
  }
`;

export const UPDATE_INVENTORY_ITEM = /* GraphQL*/ `
    mutation UpdateInventoryItem($id: ID!, $data: InventoryItemUpdateInput!) {
        inventoryItems {
            updateInventoryItem(id: $id, data: $data) {
                id
                title
                description
            }
        }
    }
`;

export const DELETE_INVENTORY_ITEM = /* GraphQL */ `
  mutation DeleteInventoryItem($id: ID!) {
    inventoryItems {
      deleteInventoryItem(id: $id) {
        id
        title
        description
      }
    }
  }
`;

export const LIST_INVENTORY_ITEMS = /* GraphQL */ `
  query ListInventoryItems($sort: InventoryItemsListSort, $limit: Int, $after: String) {
    inventoryItems {
      listInventoryItems(sort: $sort, limit: $limit, after: $after) {
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
