export default /* GraphQL */ `
  type Order {
    id: ID!
    shipmentId: String
    shipmentLocationId: String
    channelLocationId: String
    channelName: String
    metadata: OrderMetadata
    locationId: String
    status: String
    archived: Boolean
    lineItems: [OrderLineItem]
    charges: [ChargeLineItem]
    packages: [OrderPackage]
    shippingInfo: OrderShippingInfo
    shopifyOrder: ShopifyOrderInfo
    creationDateTime: DateTime
    lastUpdatedDateTime: DateTime
    createdOn: DateTime!
    savedOn: DateTime!
    createdBy: OrderCreatedBy
  }

  type OrderMetadata {
    numberOfUnits: Number
    buyerOrderId: String
    priority: Boolean
    shipmentType: String
  }

  type OrderLineItem {
    id: String
    merchantSku: String
    numberOfUnits: Int
    charges: [ChargeLineItem]
  }

  type ChargeLineItem {
    totalTax: OrderTotalTax
    totalCharge: ChargeAmount
    baseCharge: ChargeAmount
  }

  type OrderTotalTax {
    charge: ChargeAmount
    type: String
  }

  type ChargeAmount {
    netAmount: MoneyAmount
    discountAmount: MoneyAmount
    baseAmount: MoneyAmount
  }

  type MoneyAmount {
    value: Number
    currency: String
  }

  type OrderPackage {
    id: String
    status: String
    shippingLabel: OrderPackageShippingLabel
    invoice: OrderPackageInvoice
    dimensions: OrderPackageDimensions
    weight: OrderPackageWeight
    packageLineItems: [OrderPackageLineItem]
  }

  type OrderPackageShippingLabel {
    metadata: OrderPackageShippingLabelMetadata
    document: OrderDocument
  }

  type OrderPackageInvoice {
    document: OrderDocument
  }

  type OrderPackageShippingLabelMetadata {
    carrierName: String
    pickupWindow: OrderPackageShippingLabelMetadataPickupWindow
    trackingId: String
  }

  type OrderPackageShippingLabelMetadataPickupWindow {
    startTime: Number
    endTime: Number
  }

  type OrderDocument {
    format: String
    content: String
  }

  type OrderPackageDimensions {
    length: OrderPackageDimension
    width: OrderPackageDimension
    height: OrderPackageDimension
  }

  type OrderPackageDimension {
    value: String
    dimensionUnit: String
  }

  type OrderPackageWeight {
    value: String
    weightUnit: String
  }

  type OrderPackageLineItem {
    packageLineItem: OrderPackageLineItemPackageLineItem
    quantity: Number
    serialNumbers: [String]
  }

  type OrderPackageLineItemPackageLineItem {
    id: String
  }

  type OrderShippingInfo {
    recommendedShipMethod: String
    expectedShippingDateTime: String
    shipToAddress: Address
  }

  type ShopifyOrderInfo {
    orderId: Number
    orderNumber: String
    shopifyDomain: String
  }

  type Address {
    name: String
    addressLine1: String
    addressLine2: String
    addressLine3: String
    city: String
    state: String
    district: String
    postalCode: String
    countryCode: String
    phoneNumber: String
  }

  type OrderCreatedBy {
    id: String!
    type: String!
    displayName: String!
  }

  input OrderCreateInput {
    shipmentId: String!
  }

  input OrderConfirmInput {
    shipmentId: String!
  }

  type OrdersListMeta {
    cursor: String
    totalCount: Int
    hasMoreItems: Boolean
  }

  input OrdersListWhereInput {
    shipmentLocationId: String
    status: String
    archived: Boolean
  }

  enum OrdersListSort {
    createdOn_ASC
    createdOn_DESC
  }

  type OrdersList {
    data: [Order]
    meta: OrdersListMeta
  }

  input PackageInput {
    length: Number
    lengthUnit: String
    width: Number
    widthUnit: String
    height: Number
    heightUnit: String
    weight: Number
    weightUnit: String
  }

  input CreatePackagesInput {
    packages: [PackageInput]
  }

  input RejectOrderInput {
    reason: String
  }

  type OrderQuery {
    # Returns a single Order entry.
    getOrder(id: ID!): Order

    # Lists one or more Order entries.
    listOrders(
      limit: Int
      before: String
      after: String
      search: String
      where: OrdersListWhereInput
      sort: OrdersListSort
    ): OrdersList!
  }

  input ShopifyOrderInfoInput {
    orderId: Number
    orderNumber: String
    shopifyDomain: String
  }

  input UpdateOrderInput {
    shopifyOrder: ShopifyOrderInfoInput
  }

  type OrderMutation {
    # Update order
    updateOrder(id: ID!, data: UpdateOrderInput!): Order

    # Confirm a new Order entry.
    confirmOrder(id: ID!): Order!

    # Confirm a new Order entry.
    refreshOrder(id: ID!): Order!

    # Deletes and returns an existing Order entry.
    deleteOrder(id: ID!): Order!

    # Deletes and returns an existing Order entry.
    archiveOrder(id: ID!): Order!

    # Reject an existing Order entry.
    rejectOrder(id: ID!, data: RejectOrderInput!): Order!

    # Deletes and returns an existing Order entry.
    createPackages(id: ID!, data: CreatePackagesInput!): Order!

    # Deletes and returns an existing Order entry.
    generateShippingLabel(id: ID!): Order!

    shipComplete(id: ID!, packageIds: [String]): Order!
  }

  extend type Query {
    orders: OrderQuery
  }

  extend type Mutation {
    orders: OrderMutation
  }
`;
