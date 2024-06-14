import { Context } from '~/types';
import { getPK } from '@purity/core/storeLocations/crud'

export default class StoreLocationsResolver {
  protected readonly context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  getPK() {
    return getPK();
  }
}
