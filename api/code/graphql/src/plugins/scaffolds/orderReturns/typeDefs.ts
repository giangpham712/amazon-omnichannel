export default /* GraphQL */ `
  type OrderReturn {
    id: ID!
    marketplaceChannelDetails: JSON
    creationDateTime: String
    lastUpdatedDateTime: String
    fulfillmentLocationId: String
    returnId: String
    merchantSku: String
    numberOfUnits: Int
    returnMetadata: JSON
    returnShippingInfo: JSON
    returnType: String
    status: String
    createdOn: DateTime!
    savedOn: DateTime!
    createdBy: OrderReturnCreatedBy
  }

  type PendingOrderReturn {
    marketplaceChannelDetails: JSON
    creationDateTime: String
    lastUpdatedDateTime: String
    fulfillmentLocationId: String
    returnId: String
    merchantSku: String
    numberOfUnits: Int
    returnMetadata: JSON
    returnShippingInfo: JSON
    returnType: String
    status: String
  }

  type OrderReturnCreatedBy {
    id: String!
    type: String!
    displayName: String!
  }

  input OrderReturnCreateInput {
    returnId: String!
    itemConditions: OrderReturnItemConditionsInput!
  }

  input OrderReturnItemConditionsInput {
    sellable: Int
    defective: Int
    customerDamaged: Int
    carrierDamaged: Int
    fraud: Int
    wrongItem: Int
  }

  type OrderReturnsListMeta {
    limit: Number
    before: String
    after: String
  }

  enum OrderReturnsListSort {
    createdOn_ASC
    createdOn_DESC
  }

  type OrderReturnsList {
    data: [OrderReturn]
    meta: OrderReturnsListMeta
  }

  type PendingOrderReturnsList {
    data: [PendingOrderReturn]
  }

  type OrderReturnQuery {
    # Returns a single OrderReturn entry.
    getOrderReturn(id: ID!): OrderReturn

    # Lists one or more OrderReturn entries.
    listOrderReturns(limit: Int, before: String, after: String, sort: OrderReturnsListSort): OrderReturnsList!

    # Lists one or more OrderReturn entries.
    listPendingOrderReturnsByRmaId(rmaId: String): PendingOrderReturnsList!
  }

  type OrderReturnMutation {
    # Creates and returns a new OrderReturn entry.
    createOrderReturn(data: OrderReturnCreateInput!): OrderReturn!
  }

  extend type Query {
    orderReturns: OrderReturnQuery
  }

  extend type Mutation {
    orderReturns: OrderReturnMutation
  }
`;
