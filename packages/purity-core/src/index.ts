import { ContextPlugin } from '@webiny/handler/plugins/ContextPlugin';
import { createOrdersCrud } from './orders/crud';
import { createStoreLocationCrud } from './storeLocations';
import { createInventoryItemsCrud } from './inventoryItems';
import { createErrorHandler } from '@purity/error-handling';
import { Client } from '@elastic/elasticsearch';
import { PurityContext } from './types';

export const createPurityContext = ({ elasticsearch }: { elasticsearch: Client }) => {
  return [
    new ContextPlugin<PurityContext>(async context => {
      context.orders = createOrdersCrud({ elasticsearch });
      context.storeLocations = createStoreLocationCrud();
      context.inventoryItems = createInventoryItemsCrud();
      context.errors = createErrorHandler({ errorsQueue: process.env.ORDERS_ERRORS_QUEUE || '' });
    })
  ];
};
