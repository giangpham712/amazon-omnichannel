import mdbid from 'mdbid';
import WebinyError from '@webiny/error';
import { StoreLocationEntity } from '../storeLocations/types';
import { InventoryItem, InventoryItemES } from './entities';
import { InventoryItemEntity } from './types';

export interface UpsertInventoryItemParams {
  location: Partial<StoreLocationEntity>;
  sku: string;
  data: Record<string, any>;
  createdBy: any;
}

export interface UpdateInventoryItemInventoryParams {
  reservedQuantity: number;
  sellableQuantity: number;
}

export const getPK = () => {
  return `L#InventoryItems`;
};

export const getEsInventoryItemData = ({
  id,
  sku,
  asin,
  productName,
  shopifyVariant,
  storeLocation,
  productInfo,
  sellableQuantity,
  reservedQuantity,
  bufferedQuantity,
  spEtag,
  spVersion,
  createdOn,
  savedOn
}: Partial<InventoryItemEntity>) => {
  return {
    __type: 'inventoryitem',
    id,
    sku,
    asin,
    productName,
    shopifyVariant,
    storeLocation,
    productInfo,
    sellableQuantity,
    reservedQuantity,
    bufferedQuantity,
    spEtag,
    spVersion,
    createdOn,
    savedOn
  };
};

export const getGSI1SK = (locationId: string, sku: string) => `InventoryItem#${locationId}#${sku}`;

export const createInventoryItemsCrud = () => {
  return {
    async getInventoryItemsByLocation(locationId: string) {
      const PK = getPK();
      const queryResult = await InventoryItem.query(PK, {
        index: 'GSI1',
        beginsWith: `InventoryItem#${locationId}#`
      });

      return queryResult.Items as InventoryItemEntity[];
    },

    async upsert({ location, sku, data, createdBy }: UpsertInventoryItemParams) {
      const PK = getPK();
      const GSI1SK = getGSI1SK(location.id, sku);

      const queryResult = await InventoryItem.query(PK, {
        eq: getGSI1SK(location.id, sku),
        index: 'GSI1',
        limit: 1
      });

      const item = queryResult.Items[0] ?? {};

      const id = item.id ?? mdbid();
      const inventoryItem = {
        PK: PK,
        SK: id,
        GSI1_PK: PK,
        GSI1_SK: GSI1SK,
        id,
        ...item,
        ...data,
        TYPE: 'inventoryItem',
        createdOn: new Date().toISOString(),
        savedOn: new Date().toISOString(),
        createdBy: createdBy ?? {
          id: 'SYSTEM',
          type: 'system',
          displayName: 'System'
        },
        webinyVersion: process.env.WEBINY_VERSION
      };

      // console.log(inventoryItem);

      try {
        await InventoryItem.put(inventoryItem);
      } catch (e) {
        throw new WebinyError(
          `Could not upsert InventoryItem in DynamoDB. ${e.message}`,
          'UPDATE_INVENTORY_ITEM_ERROR',
          {
            error: e
          }
        );
      }

      try {
        await InventoryItemES.put({
          index: 'root-inventory-item',
          PK: getPK(),
          SK: id,
          data: getEsInventoryItemData(inventoryItem)
        });
      } catch (e) {
        throw new WebinyError(
          `Could not upsert InventoryItem in Elasticsearch. ${e.message}`,
          'UPDATE_ES_INVENTORY_ITEM_ERROR',
          {
            error: e
          }
        );
      }
    },
    async getByLocationAndSku(locationId: string, sku: string): Promise<InventoryItemEntity> {
      const PK = getPK();
      const queryResult = await InventoryItem.query(PK, {
        eq: getGSI1SK(locationId, sku),
        index: 'GSI1'
      });

      return queryResult.Items.length > 0 ? queryResult.Items[0] : null;
    }
  };
};
