export const STORE_LOCATION_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment StoreLocationFields on StoreLocation {
    id
    name
    storeAdminEmail,
    spSupplySourceId
    spSupplySourceCode
    shopifyDomain
    shopifyLocationId
    createdOn
    savedOn
    createdBy {
      id
      displayName
      type
    }
  }
`;
