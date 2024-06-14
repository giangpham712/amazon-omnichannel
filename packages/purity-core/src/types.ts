import { HttpContext } from '@webiny/handler-http/types';
import { ArgsContext } from '@webiny/handler-args/types';
import { OrdersCrud } from './orders/types';
import { StoreLocationsCrud } from './storeLocations';
import { InventoryItemsCrud } from './inventoryItems';

export interface PurityContext extends HttpContext, ArgsContext {
  orders: OrdersCrud;
  storeLocations: StoreLocationsCrud;
  inventoryItems: InventoryItemsCrud;
  errors: any;
}
