// If our GraphQL API uses Webiny Security Framework, we can retrieve the
// currently logged in identity and assign it to the `createdBy` property.
// https://www.webiny.com/docs/key-topics/security-framework/introduction
import { SecurityIdentity } from '@webiny/api-security/types';
import { StoreLocationEntity } from '../storeLocations/types';
import { UpsertInventoryItemParams } from './crud';

export interface InventoryItemEntity {
  PK: string;
  SK: string;
  id: string;
  asin: string;
  sku: string;
  productName: string;
  shopifyVariant: {
    id: number;
    title: string;
    product: {
      id: number;
      title: string;
      featureImage: string;
    };
  };
  bufferedQuantity: number;
  reservedQuantity: number;
  sellableQuantity: number;
  spEtag: string;
  spVersion: string;
  storeLocation: Pick<
    StoreLocationEntity,
    'id' | 'name' | 'spSupplySourceId' | 'spSupplySourceCode' | 'shopifyDomain' | 'shopifyLocationId'
  >;
  productInfo: InventoryItemProductInfo;
  createdOn: string;
  savedOn: string;
  createdBy: Pick<SecurityIdentity, 'id' | 'displayName' | 'type'>;
  webinyVersion: string;
}

export interface InventoryItemProductInfo {
  netWeight: string;
  shippingWeightOz: number;
  shippingWeightG: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface InventoryItemsCrud {
  upsert({ location, sku, data, createdBy }: UpsertInventoryItemParams);
  getByLocationAndSku(locationId: string, sku: string): Promise<InventoryItemEntity>;
}
