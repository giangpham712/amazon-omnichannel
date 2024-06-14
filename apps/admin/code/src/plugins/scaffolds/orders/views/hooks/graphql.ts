import gql from 'graphql-tag';
import { STORE_LOCATION_FIELDS_FRAGMENT } from '../../../types';

// The same set of fields is being used on all query and mutation operations below.
export const SIMPLE_ORDER_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment OrderFields on Order {
    id
    shipmentId
    shipmentLocationId
    status
    archived
    creationDateTime
    lastUpdatedDateTime
    metadata {
      buyerOrderId
    }
    shippingInfo {
      recommendedShipMethod
    }
    createdBy {
      id
      displayName
      type
    }
  }
`;

export const ORDER_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment OrderFields on Order {
    id
    shipmentId
    shipmentLocationId
    channelLocationId
    channelName
    metadata {
      numberOfUnits
      buyerOrderId
      priority
      shipmentType
    }
    status
    archived
    lineItems {
      id
      merchantSku
      numberOfUnits
    }
    packages {
      id
      status
      shippingLabel {
        document {
          format
          content
        }
        metadata {
          carrierName
          trackingId
          pickupWindow {
            startTime
            endTime
          }
        }
      }
      invoice {
        document {
          format
          content
        }
      }
      dimensions {
        length {
          value
          dimensionUnit
        }
        width {
          value
          dimensionUnit
        }
        height {
          value
          dimensionUnit
        }
      }
      weight {
        value
        weightUnit
      }
      packageLineItems {
        packageLineItem {
          id
        }
        quantity
        serialNumbers
      }
    }
    creationDateTime
    lastUpdatedDateTime
    shippingInfo {
      recommendedShipMethod
      expectedShippingDateTime
      shipToAddress {
        name
        addressLine1
        addressLine2
        addressLine3
        city
        state
        district
        postalCode
        countryCode
        phoneNumber
      }
    }
    shopifyOrder {
      orderId
      orderNumber
      shopifyDomain
    }
    savedOn
    createdBy {
      id
      displayName
      type
    }
  }
`;

export const LIST_ORDERS = gql`
  ${SIMPLE_ORDER_FIELDS_FRAGMENT}
  query ListOrders($sort: OrdersListSort, $limit: Int, $after: String, $search: String, $where: OrdersListWhereInput) {
    orders {
      listOrders(sort: $sort, limit: $limit, after: $after, search: $search, where: $where) {
        data {
          ...OrderFields
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

export const CONFIRM_ORDER = gql`
  ${ORDER_FIELDS_FRAGMENT}
  mutation ConfirmOrder($id: ID!) {
    orders {
      confirmOrder(id: $id) {
        ...OrderFields
      }
    }
  }
`;

export const REJECT_ORDER = gql`
  ${ORDER_FIELDS_FRAGMENT}
  mutation RejectOrder($id: ID!, $data: RejectOrderInput!) {
    orders {
      rejectOrder(id: $id, data: $data) {
        ...OrderFields
      }
    }
  }
`;

export const GET_ORDER = gql`
  ${ORDER_FIELDS_FRAGMENT}
  query GetOrder($id: ID!) {
    orders {
      getOrder(id: $id) {
        ...OrderFields
      }
    }
  }
`;

export const DELETE_ORDER = gql`
  ${ORDER_FIELDS_FRAGMENT}
  mutation DeleteOrder($id: ID!) {
    orders {
      deleteOrder(id: $id) {
        ...OrderFields
      }
    }
  }
`;

export const REFRESH_ORDER = gql`
  ${ORDER_FIELDS_FRAGMENT}
  mutation RefreshOrder($id: ID!) {
    orders {
      refreshOrder(id: $id) {
        ...OrderFields
      }
    }
  }
`;

export const ARCHIVE_ORDER = gql`
  ${ORDER_FIELDS_FRAGMENT}
  mutation ArchiveOrder($id: ID!) {
    orders {
      archiveOrder(id: $id) {
        ...OrderFields
      }
    }
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
      title
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

export const CREATE_PACKAGES = gql`
  ${ORDER_FIELDS_FRAGMENT}
  mutation CreatePackages($id: ID!, $data: CreatePackagesInput!) {
    orders {
      createPackages(id: $id, data: $data) {
        ...OrderFields
      }
    }
  }
`;

export const GENERATE_SHIPPING_LABEL = gql`
  ${ORDER_FIELDS_FRAGMENT}
  mutation GenerateShippingLabel($id: ID!) {
    orders {
      generateShippingLabel(id: $id) {
        ...OrderFields
      }
    }
  }
`;

export const SHIP_COMPLETE = gql`
  ${ORDER_FIELDS_FRAGMENT}
  mutation ShipComplete($id: ID!) {
    orders {
      shipComplete(id: $id) {
        ...OrderFields
      }
    }
  }
`;
