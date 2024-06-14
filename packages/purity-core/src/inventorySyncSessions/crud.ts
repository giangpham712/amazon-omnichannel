import mdbid from 'mdbid';
import WebinyError from '@webiny/error';
import { InventorySyncSessionEntity } from './types';
import { InventorySyncSession } from './entities';

export const getPK = () => {
  return `L#$InventorySyncSessions`;
};

export const getGSI1SK = () => ``;

export const createInventorySyncSessionCrud = () => {
  return {
    async add(data: Partial<InventorySyncSessionEntity>) {
      const PK = getPK();
      const id = mdbid();
      const entity = {
        PK: PK,
        SK: id,
        id,
        ...data,
        TYPE: 'inventorySyncSession',
        createdOn: new Date().toISOString(),
        savedOn: new Date().toISOString(),
        createdBy: {
          id: 'SYSTEM',
          type: 'system',
          displayName: 'System'
        },
        webinyVersion: process.env.WEBINY_VERSION
      };

      try {
        await InventorySyncSession.put(entity);
      } catch (e) {
        throw new WebinyError(
          `Could not upsert InventorySyncSession in DynamoDB. ${e.message}`,
          'UPDATE_INVENTORY_SYNC_SESSION_ERROR',
          {
            error: e
          }
        );
      }
    }
  };
};
