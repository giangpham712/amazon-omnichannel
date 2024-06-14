import { Context } from '~/types';
import { getPK } from '@purity/core/inventorySyncSessions';

export default class InventorySyncSessionsResolver {
  protected readonly context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  /**
   * Generates primary key (PK), to be used upon mutating / querying DynamoDB data.
   * @param base
   */
  getPK() {
    return getPK();
  }
}
