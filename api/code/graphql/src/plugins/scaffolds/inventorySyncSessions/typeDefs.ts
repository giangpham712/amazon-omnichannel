export default /* GraphQL */ `
  type InventorySyncSession {
    id: ID!
    title: String!
    description: String
    startedAt: DateTime
    finishedAt: DateTime
    status: String
    locations: [InventorySyncSessionLocation]
    createdOn: DateTime!
    savedOn: DateTime!
    createdBy: InventorySyncSessionCreatedBy
  }
  
  type InventorySyncSessionLocation {
    location: LocationInfo
    status: String,
    operations: [InventorySyncOp],
    logs: [LogMessage]
  }
  
  type LocationInfo {
    id: String!
    name: String
  }
  
  type InventorySyncOp {
    sku: String
    oldQty: Float
    newQty: Float
    at: DateTime
    result: String
    logs: [LogMessage]
  }
  
  type LogMessage {
   at: DateTime,
   message: String
  }

  type InventorySyncSessionCreatedBy {
    id: String!
    type: String!
    displayName: String!
  }

  input InventorySyncSessionCreateInput {
    title: String!
    description: String
  }

  input InventorySyncSessionUpdateInput {
    title: String
    description: String
  }

  type InventorySyncSessionsListMeta {
    limit: Number
    before: String
    after: String
  }

  enum InventorySyncSessionsListSort {
    createdOn_ASC
    createdOn_DESC
  }

  type InventorySyncSessionsList {
    data: [InventorySyncSession]
    meta: InventorySyncSessionsListMeta
  }

  type InventorySyncSessionQuery {
    # Returns a single InventorySyncSession entry.
    getInventorySyncSession(id: ID!): InventorySyncSession

    # Lists one or more InventorySyncSession entries.
    listInventorySyncSessions(
      limit: Int
      before: String
      after: String
      sort: InventorySyncSessionsListSort
    ): InventorySyncSessionsList!
  }

  type InventorySyncSessionMutation {
    # Creates and returns a new InventorySyncSession entry.
    createInventorySyncSession(data: InventorySyncSessionCreateInput!): InventorySyncSession!

    # Updates and returns an existing InventorySyncSession entry.
    updateInventorySyncSession(id: ID!, data: InventorySyncSessionUpdateInput!): InventorySyncSession!

    # Deletes and returns an existing InventorySyncSession entry.
    deleteInventorySyncSession(id: ID!): InventorySyncSession!
  }

  extend type Query {
    inventorySyncSessions: InventorySyncSessionQuery
  }

  extend type Mutation {
    inventorySyncSessions: InventorySyncSessionMutation
  }
`;
