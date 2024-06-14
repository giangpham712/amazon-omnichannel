import { Context } from '~/types';
import { getPK } from '@purity/core/inventoryItems/crud'

export default class InventoryItemsResolver {
  protected readonly context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  /**
   * Generates primary key (PK), to be used upon mutating / querying DynamoDB data.
   * @param base
   */
  getPK(base = 'InventoryItem') {
    return getPK();
  }
}
