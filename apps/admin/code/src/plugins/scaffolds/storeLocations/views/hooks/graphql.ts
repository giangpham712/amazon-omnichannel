import gql from 'graphql-tag';
import { STORE_LOCATION_FIELDS_FRAGMENT } from '../../../types';

export const LIST_STORE_LOCATIONS = gql`
  ${STORE_LOCATION_FIELDS_FRAGMENT}
  query ListStoreLocations($sort: StoreLocationsListSort, $limit: Int, $after: String, $before: String) {
    storeLocations {
      listStoreLocations(sort: $sort, limit: $limit, after: $after, before: $before) {
        data {
          ...StoreLocationFields
        }
        meta {
          before
          after
          limit
        }
      }
    }
  }
`;

export const CREATE_STORE_LOCATION = gql`
  ${STORE_LOCATION_FIELDS_FRAGMENT}
  mutation CreateStoreLocation($data: StoreLocationCreateInput!) {
    storeLocations {
      createStoreLocation(data: $data) {
        ...StoreLocationFields
      }
    }
  }
`;

export const GET_STORE_LOCATION = gql`
  ${STORE_LOCATION_FIELDS_FRAGMENT}
  query GetStoreLocation($id: ID!) {
    storeLocations {
      getStoreLocation(id: $id) {
        ...StoreLocationFields
      }
    }
  }
`;

export const DELETE_STORE_LOCATION = gql`
  ${STORE_LOCATION_FIELDS_FRAGMENT}
  mutation DeleteStoreLocation($id: ID!) {
    storeLocations {
      deleteStoreLocation(id: $id) {
        ...StoreLocationFields
      }
    }
  }
`;

export const UPDATE_STORE_LOCATION = gql`
  ${STORE_LOCATION_FIELDS_FRAGMENT}
  mutation UpdateStoreLocation($id: ID!, $data: StoreLocationUpdateInput!) {
    storeLocations {
      updateStoreLocation(id: $id, data: $data) {
        ...StoreLocationFields
      }
    }
  }
`;
