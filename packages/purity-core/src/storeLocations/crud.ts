import StoreLocation from './entities';
import WebinyError from '@webiny/error';
import { StoreLocationEntity, StoreLocationsCrud } from './types';
import { queryOne } from '@webiny/db-dynamodb/utils/query';

export const createStoreLocationCrud = (): StoreLocationsCrud => {
  return {
    async getAll(): Promise<StoreLocationEntity[]> {
      try {
        const query = {};
        const { Items } = await StoreLocation.query(getPK(), { ...query, limit: 1000 });
        const data = Items.map(item => ({
          id: item.id,
          name: item.name,
          spSupplySourceId: item.spSupplySourceId,
          spSupplySourceCode: item.spSupplySourceCode,
          shopifyDomain: item.shopifyDomain,
          shopifyLocationId: item.shopifyLocationId,
          storeAdminEmail: item.storeAdminEmail,
          createdOn: item.createdOn,
          savedOn: item.savedOn
        }));

        return data;
      } catch (e) {
        throw new WebinyError(
          `Could not get store locations from DynamoDB table. ${e.message}`,
          'GET_LIST_STORE_LOCATION_ERROR',
          {
            error: e
          }
        );
      }
    },
    async getStoreLocationBySPSupplySource(spSupplySourceId): Promise<StoreLocationEntity> {
      const storeLocation = await queryOne<StoreLocationEntity>({
        entity: StoreLocation,
        partitionKey: getPK(),
        options: {
          index: 'GSI1',
          eq: spSupplySourceId
        }
      });

      if (!storeLocation) {
        throw new Error(`StoreLocation with SP Supply Source ID "${spSupplySourceId}" not found.`);
      }

      return storeLocation;
    }
  };
};

export const getPK = () => {
  return `L#StoreLocation`;
};
