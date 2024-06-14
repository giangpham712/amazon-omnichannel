// If our GraphQL API uses Webiny Security Framework, we can retrieve the
// currently logged in identity and assign it to the `createdBy` property.
// https://www.webiny.com/docs/key-topics/security-framework/introduction
import { SecurityIdentity } from '@webiny/api-security/types';

export interface StoreLocationEntity {
  PK: string;
  SK: string;
  id: string;
  name: string;
  spSupplySourceId: string;
  spSupplySourceCode: string;
  shopifyDomain?: string;
  shopifyLocationId?: string;
  storeAdminEmail?: string;
  createdOn: string;
  savedOn: string;
  createdBy: Pick<SecurityIdentity, 'id' | 'displayName' | 'type'>;
  webinyVersion: string;
}

export interface StoreLocationsCrud {
  getAll(): Promise<StoreLocationEntity[]>;
  getStoreLocationBySPSupplySource(spSupplySourceId): Promise<StoreLocationEntity>;
}
