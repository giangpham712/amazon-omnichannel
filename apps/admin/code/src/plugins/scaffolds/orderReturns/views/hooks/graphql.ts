import gql from 'graphql-tag';

// The same set of fields is being used on all query and mutation operations below.
export const ORDER_RETURN_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment OrderReturnFields on OrderReturn {
    id
    marketplaceChannelDetails
    creationDateTime
    lastUpdatedDateTime
    fulfillmentLocationId
    returnId
    merchantSku
    numberOfUnits
    returnMetadata
    returnShippingInfo
    returnType
    status
    createdOn
    savedOn
    createdBy {
      id
      displayName
      type
    }
  }
`;

export const PENDING_ORDER_RETURN_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment PendingOrderReturnFields on PendingOrderReturn {
    marketplaceChannelDetails
    creationDateTime
    lastUpdatedDateTime
    fulfillmentLocationId
    returnId
    merchantSku
    numberOfUnits
    returnMetadata
    returnShippingInfo
    returnType
    status
  }
`;

const INVENTORY_ITEM_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment InventoryItemFields on InventoryItem {
    id
    asin
    sku
    productName
    bufferedQuantity
    reservedQuantity
    sellableQuantity
    createdOn
    productInfo {
      netWeight
      shippingWeightOz
      shippingWeightG
      lengthCm
      widthCm
      heightCm
    }
    shopifyVariant {
      product {
        featureImage
      }
    }
    savedOn
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

export const LIST_PENDING_ORDER_RETURNS_BY_RMA_ID = gql`
  ${PENDING_ORDER_RETURN_FIELDS_FRAGMENT}
  query ListPendingOrderReturnsByRmaId($rmaId: String) {
    orderReturns {
      listPendingOrderReturnsByRmaId(rmaId: $rmaId) {
        data {
          ...PendingOrderReturnFields
        }
      }
    }
  }
`;

export const LIST_ORDER_RETURNS = gql`
  ${ORDER_RETURN_FIELDS_FRAGMENT}
  query ListOrderReturns($sort: OrderReturnsListSort, $limit: Int, $after: String, $before: String) {
    orderReturns {
      listOrderReturns(sort: $sort, limit: $limit, after: $after, before: $before) {
        data {
          ...OrderReturnFields
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

export const LIST_INVENTORY_ITEMS = gql`
  ${INVENTORY_ITEM_FIELDS_FRAGMENT}
  query ListInventoryItems($limit: Int, $sort: InventoryItemsListSort, $where: InventoryItemsListWhereInput) {
    inventoryItems {
      listInventoryItems(limit: $limit, sort: $sort, where: $where) {
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

export const GET_INVENTORY_ITEM = gql`
  ${INVENTORY_ITEM_FIELDS_FRAGMENT}
  query GetInventoryItem($locationId: ID!, $sku: String) {
    inventoryItems {
      getInventoryItemByLocationAndSku(locationId: $locationId, sku: $sku) {
        ...InventoryItemFields
      }
    }
  }
`;

export const CREATE_ORDER_RETURN = gql`
  ${ORDER_RETURN_FIELDS_FRAGMENT}
  mutation CreateOrderReturn($data: OrderReturnCreateInput!) {
    orderReturns {
      createOrderReturn(data: $data) {
        ...OrderReturnFields
      }
    }
  }
`;

export const GET_ORDER_RETURN = gql`
  ${ORDER_RETURN_FIELDS_FRAGMENT}
  query GetOrderReturn($id: ID!) {
    orderReturns {
      getOrderReturn(id: $id) {
        ...OrderReturnFields
      }
    }
  }
`;

export const GET_STORE_LOCATION = gql`
  query GetStoreLocation($spSupplySourceId: String) {
    storeLocations {
      getStoreLocationBySPSupplySource(spSupplySourceId: $spSupplySourceId) {
        id
        name
      }
    }
  }
`;
