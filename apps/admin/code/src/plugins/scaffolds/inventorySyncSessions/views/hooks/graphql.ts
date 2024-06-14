import gql from 'graphql-tag';

// The same set of fields is being used on all query and mutation operations below.
export const INVENTORY_SYNC_SESSION_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment InventorySyncSessionFields on InventorySyncSession {
    id
    title
    description
    status
    createdOn
    savedOn
    startedAt
    finishedAt
    createdBy {
      id
      displayName
      type
    }
  }
`;

export const INVENTORY_SYNC_SESSION_ALL_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment InventorySyncSessionAllFields on InventorySyncSession {
    id
    title
    description
    status
    createdOn
    savedOn
    startedAt
    finishedAt
    locations {
      location {
        id
        name 
      }
      status
      operations {
        at
        sku
        oldQty
        newQty
        result
        logs {
          at
          message
        }
      }
      logs {
        at
        message
      }
    }
    createdBy {
      id
      displayName
      type
    }
  }
`;

export const LIST_INVENTORY_SYNC_SESSIONS = gql`
  ${INVENTORY_SYNC_SESSION_FIELDS_FRAGMENT}
  query ListInventorySyncSessions($sort: InventorySyncSessionsListSort, $limit: Int, $after: String, $before: String) {
    inventorySyncSessions {
      listInventorySyncSessions(sort: $sort, limit: $limit, after: $after, before: $before) {
        data {
          ...InventorySyncSessionFields
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

export const CREATE_INVENTORY_SYNC_SESSION = gql`
  ${INVENTORY_SYNC_SESSION_FIELDS_FRAGMENT}
  mutation CreateInventorySyncSession($data: InventorySyncSessionCreateInput!) {
    inventorySyncSessions {
      createInventorySyncSession(data: $data) {
        ...InventorySyncSessionFields
      }
    }
  }
`;

export const GET_INVENTORY_SYNC_SESSION = gql`
  ${INVENTORY_SYNC_SESSION_ALL_FIELDS_FRAGMENT}
  query GetInventorySyncSession($id: ID!) {
    inventorySyncSessions {
      getInventorySyncSession(id: $id) {
        ...InventorySyncSessionAllFields
      }
    }
  }
`;

export const DELETE_INVENTORY_SYNC_SESSION = gql`
  ${INVENTORY_SYNC_SESSION_FIELDS_FRAGMENT}
  mutation DeleteInventorySyncSession($id: ID!) {
    inventorySyncSessions {
      deleteInventorySyncSession(id: $id) {
        ...InventorySyncSessionFields
      }
    }
  }
`;

export const UPDATE_INVENTORY_SYNC_SESSION = gql`
  ${INVENTORY_SYNC_SESSION_FIELDS_FRAGMENT}
  mutation UpdateInventorySyncSession($id: ID!, $data: InventorySyncSessionUpdateInput!) {
    inventorySyncSessions {
      updateInventorySyncSession(id: $id, data: $data) {
        ...InventorySyncSessionFields
      }
    }
  }
`;
