export default /* GraphQL */ `
  type InventoryItem {
    id: ID!
    asin: String
    sku: String
    productName: String
    bufferedQuantity: Float
    reservedQuantity: Float
    sellableQuantity: Float
    spEtag: String
    spVersion: String
    storeLocation: InventoryItemStoreLocation
    shopifyVariant: InventoryItemShopifyVariant
    productInfo: InventoryItemProductInfo
    createdOn: DateTime!
    savedOn: DateTime!
    createdBy: InventoryItemCreatedBy
  }

  type InventoryItemStoreLocation {
    id: String!
    name: String!
    spSupplySourceId: String
    spSupplySourceCode: String
    shopifyDomain: String
    shopifyLocationId: String
  }

  type InventoryItemProductInfo {
    netWeight: String
    shippingWeightOz: Float
    shippingWeightG: Float
    lengthCm: Float
    widthCm: Float
    heightCm: Float
  }

  type InventoryItemShopifyVariant {
    id: Float
    title: String
    product: InventoryItemShopifyVariantProduct
  }

  type InventoryItemShopifyVariantProduct {
    id: Float
    title: String
    featureImage: String
  }

  type InventoryItemCreatedBy {
    id: String!
    type: String!
    displayName: String!
  }

  input InventoryItemCreateInput {
    asin: String
    sku: String
    productName: String
  }

  input InventoryItemUpdateInput {
    asin: String
    sku: String
    productName: String
    bufferedQuantity: Float
    reservedQuantity: Float
    sellableQuantity: Float
  }

  type InventoryItemsListMeta {
    cursor: String
    totalCount: Int
    hasMoreItems: Boolean
  }

  enum InventoryItemsListSort {
    createdOn_ASC
    createdOn_DESC
    productName_ASC
    productName_DESC
    sku_ASC
    sku_DESC
  }

  input InventoryItemsListWhereInput {
    storeLocationId: String
    stockStatus: String
    skus: [String]
  }

  type InventoryItemsList {
    data: [InventoryItem]
    meta: InventoryItemsListMeta
  }

  type InventoryItemQuery {
    # Returns a single InventoryItem entry.
    getInventoryItem(id: ID!): InventoryItem

    # Get by locationId, sku
    getInventoryItemByLocationAndSku(locationId: ID!, sku: String): InventoryItem

    # Lists one or more InventoryItem entries.
    listInventoryItems(
      limit: Int
      before: String
      after: String
      where: InventoryItemsListWhereInput
      search: String
      sort: InventoryItemsListSort
    ): InventoryItemsList!
  }

  type InventoryItemMutation {
    # Creates and returns a new InventoryItem entry.
    createInventoryItem(data: InventoryItemCreateInput!): InventoryItem!

    # Updates and returns an existing InventoryItem entry.
    updateInventoryItem(id: ID!, data: InventoryItemUpdateInput!): InventoryItem!

    # Deletes and returns an existing InventoryItem entry.
    deleteInventoryItem(id: ID!): InventoryItem!
  }

  extend type Query {
    inventoryItems: InventoryItemQuery
  }

  extend type Mutation {
    inventoryItems: InventoryItemMutation
  }
`;
