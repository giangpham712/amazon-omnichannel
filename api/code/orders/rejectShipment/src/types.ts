import { HttpContext } from '@webiny/handler-http/types';
import { ArgsContext } from '@webiny/handler-args/types';
import { OrdersCrud } from '@purity/core/orders/types';
import { StoreLocationsCrud } from '@purity/core/storeLocations/types';
import { InventoryItemsCrud } from '@purity/core/inventoryItems/types';

export interface OrdersRejectShipmentContext extends HttpContext, ArgsContext {
  orders: OrdersCrud;
  storeLocations: StoreLocationsCrud;
  inventoryItems: InventoryItemsCrud;
  errors: any;
}
