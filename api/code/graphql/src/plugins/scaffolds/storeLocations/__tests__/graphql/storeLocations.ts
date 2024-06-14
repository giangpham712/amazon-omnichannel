/**
 * Contains all of the GraphQL queries and mutations that we might need while writing our tests.
 * If needed, feel free to add more.
 */

export const GET_STORE_LOCATION = /* GraphQL */ `
  query GetStoreLocation($id: ID!) {
    storeLocations {
      getStoreLocation(id: $id) {
        id
        title
        description
      }
    }
  }
`;

export const CREATE_STORE_LOCATION = /* GraphQL */ `
  mutation CreateStoreLocation($data: StoreLocationCreateInput!) {
    storeLocations {
      createStoreLocation(data: $data) {
        id
        title
        description
      }
    }
  }
`;

export const UPDATE_STORE_LOCATION = /* GraphQL*/ `
    mutation UpdateStoreLocation($id: ID!, $data: StoreLocationUpdateInput!) {
        storeLocations {
            updateStoreLocation(id: $id, data: $data) {
                id
                title
                description
            }
        }
    }
`;

export const DELETE_STORE_LOCATION = /* GraphQL */ `
  mutation DeleteStoreLocation($id: ID!) {
    storeLocations {
      deleteStoreLocation(id: $id) {
        id
        title
        description
      }
    }
  }
`;

export const LIST_STORE_LOCATIONS = /* GraphQL */ `
  query ListStoreLocations($sort: StoreLocationsListSort, $limit: Int, $after: String) {
    storeLocations {
      listStoreLocations(sort: $sort, limit: $limit, after: $after) {
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
