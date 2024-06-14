import { SecurityIdentity } from '@webiny/api-security/types';
import { StoreLocationEntity } from '../storeLocations/types';

export enum InventorySyncOpResult {
  Updated = 'Updated',
  InProgress = 'InProgress',
  Skipped = 'Skipped',
  Failed = 'Failed'
}

export enum OperationStatus {
  InProgress = 'InProgress',
  Completed = 'Completed',
  Skipped = 'Skipped',
  Failed = 'Failed'
}

export interface LogMessage {
  at: string;
  message: string;
  details: any;
}

export interface InventorySyncOp {
  sku: string;
  oldQty: number;
  newQty: number;
  at: string;
  result: InventorySyncOpResult;
  logs: LogMessage[];
}

export interface InventorySyncSessionLocation {
  location: Pick<StoreLocationEntity, 'id' | 'name'>;
  status: OperationStatus;
  logs: LogMessage[];
  operations: InventorySyncOp[];
}

export interface InventorySyncSessionEntity {
  PK: string;
  SK: string;
  id: string;
  title: string;
  description?: string;
  startedAt?: string;
  finishedAt?: String;
  status?: string;
  locations?: InventorySyncSessionLocation[];
  createdOn: string;
  savedOn: string;
  createdBy: Pick<SecurityIdentity, 'id' | 'displayName' | 'type'>;
  webinyVersion: string;
}
