import gql from 'graphql-tag';

// The same set of fields is being used on all query and mutation operations below.
export const INVENTORY_ITEM_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment InventoryItemFields on InventoryItem {
    id
    asin
    sku
    productName
    bufferedQuantity
    reservedQuantity
    sellableQuantity

    shopifyVariant {
      id
      title
      product {
        id
        title
        featureImage
      }
    }

    productInfo {
      netWeight
      shippingWeightOz
      shippingWeightG
      lengthCm
      widthCm
      heightCm
    }

    storeLocation {
      id
      name
    }
    createdBy {
      id
      displayName
      type
    }
  }
`;

export const LIST_INVENTORY_ITEMS = gql`
  ${INVENTORY_ITEM_FIELDS_FRAGMENT}
  query ListInventoryItems(
    $limit: Int
    $sort: InventoryItemsListSort
    $search: String
    $where: InventoryItemsListWhereInput
    $after: String
    $before: String
  ) {
    inventoryItems {
      listInventoryItems(limit: $limit, sort: $sort, search: $search, where: $where, after: $after, before: $before) {
        data {
          ...InventoryItemFields
        }
        meta {
          hasMoreItems
          cursor
          totalCount
        }
      }
    }
  }
`;

export const CREATE_INVENTORY_ITEM = gql`
  ${INVENTORY_ITEM_FIELDS_FRAGMENT}
  mutation CreateInventoryItem($data: InventoryItemCreateInput!) {
    inventoryItems {
      createInventoryItem(data: $data) {
        ...InventoryItemFields
      }
    }
  }
`;

export const GET_INVENTORY_ITEM = gql`
  ${INVENTORY_ITEM_FIELDS_FRAGMENT}
  query GetInventoryItem($id: ID!) {
    inventoryItems {
      getInventoryItem(id: $id) {
        ...InventoryItemFields
      }
    }
  }
`;

export const DELETE_INVENTORY_ITEM = gql`
  ${INVENTORY_ITEM_FIELDS_FRAGMENT}
  mutation DeleteInventoryItem($id: ID!) {
    inventoryItems {
      deleteInventoryItem(id: $id) {
        ...InventoryItemFields
      }
    }
  }
`;

export const UPDATE_INVENTORY_ITEM = gql`
  ${INVENTORY_ITEM_FIELDS_FRAGMENT}
  mutation UpdateInventoryItem($id: ID!, $data: InventoryItemUpdateInput!) {
    inventoryItems {
      updateInventoryItem(id: $id, data: $data) {
        ...InventoryItemFields
      }
    }
  }
`;
