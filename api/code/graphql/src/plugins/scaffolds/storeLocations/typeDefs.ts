export default /* GraphQL */ `
  type StoreLocation {
    id: ID!
    name: String!
    spSupplySourceId: String
    spSupplySourceCode: String
    shopifyDomain: String
    shopifyLocationId: String
    storeAdminEmail: String
    createdOn: DateTime!
    savedOn: DateTime!
    createdBy: StoreLocationCreatedBy
  }

  type StoreLocationCreatedBy {
    id: String!
    type: String!
    displayName: String!
  }

  input StoreLocationCreateInput {
    name: String!
    spSupplySourceId: String
    spSupplySourceCode: String
    shopifyDomain: String
    shopifyLocationId: String
    storeAdminEmail: String
  }

  input StoreLocationUpdateInput {
    name: String!
    spSupplySourceId: String
    spSupplySourceCode: String
    shopifyDomain: String
    shopifyLocationId: String
    storeAdminEmail: String
  }

  type StoreLocationsListMeta {
    limit: Number
    before: String
    after: String
  }

  enum StoreLocationsListSort {
    createdOn_ASC
    createdOn_DESC
  }

  type StoreLocationsList {
    data: [StoreLocation]
    meta: StoreLocationsListMeta
  }

  type StoreLocationQuery {
    # Returns a single StoreLocation entry.
    getStoreLocation(id: ID!): StoreLocation

    getStoreLocationBySPSupplySource(spSupplySourceId: String): StoreLocation

    # Lists one or more StoreLocation entries.
    listStoreLocations(limit: Int, before: String, after: String, sort: StoreLocationsListSort): StoreLocationsList!
  }

  type StoreLocationMutation {
    # Creates and returns a new StoreLocation entry.
    createStoreLocation(data: StoreLocationCreateInput!): StoreLocation!

    # Updates and returns an existing StoreLocation entry.
    updateStoreLocation(id: ID!, data: StoreLocationUpdateInput!): StoreLocation!

    # Deletes and returns an existing StoreLocation entry.
    deleteStoreLocation(id: ID!): StoreLocation!

    sendTestEmailNotification(email: String): Boolean
  }

  extend type Query {
    storeLocations: StoreLocationQuery
  }

  extend type Mutation {
    storeLocations: StoreLocationMutation
  }
`;
