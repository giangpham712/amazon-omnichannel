import { createHandler } from '@webiny/handler-aws';
import { Context } from './types';
import { createShopifyClient } from '@purity/shopify-api';
import { createSellingPartner, FbaInventoryItem } from '@purity/selling-partner';
import { createStoreLocationCrud } from '@purity/core/storeLocations';
import { createInventoryItemsCrud, InventoryItemEntity } from '@purity/core/inventoryItems';
import {
  createInventorySyncSessionCrud,
  OperationStatus,
  InventorySyncOp,
  InventorySyncSessionEntity,
  InventorySyncSessionLocation,
  InventorySyncOpResult
} from '@purity/core/inventorySyncSessions';

const sellingPartner = createSellingPartner({
  useSandbox: false,
  credentials: {
    SELLING_PARTNER_APP_CLIENT_ID: process.env.SELLING_PARTNER_APP_CLIENT_ID || '',
    SELLING_PARTNER_APP_CLIENT_SECRET: process.env.SELLING_PARTNER_APP_CLIENT_SECRET || '',
    AWS_ACCESS_KEY_ID: process.env.SELLING_PARTNER_AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.SELLING_PARTNER_AWS_SECRET_ACCESS_KEY || '',
    AWS_SELLING_PARTNER_ROLE: process.env.AWS_SELLING_PARTNER_ROLE || ''
  },
  refreshToken: process.env.AMZ_API_REFRESH_TOKEN || ''
});

const shopifyClient = createShopifyClient({
  shopName: process.env.SHOPIFY_HOSTNAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_API_PASSWORD
});

const storeLocationsCrud = createStoreLocationCrud();
const inventoryItemsCrud = createInventoryItemsCrud();
const inventorySyncSessionCrud = createInventorySyncSessionCrud();
const isTestMode = process.env.TEST_MODE === 'ON';
const testSkus = ['1FMCBEC', '1CMBT7G', '1BSGBO', '1CFPRPWP', '1FMOMNM'];

const logForLocation = (syncLocation: InventorySyncSessionLocation, message: string, details?: any) => {
  console.log(`${syncLocation.location.name} - ${message}`);
  syncLocation.logs.push({
    at: new Date().toISOString(),
    message: message,
    details: details
  });
};

export const handler = createHandler({
  plugins: [
    {
      type: 'handler',
      async handle(context: Context) {
        console.log(context);
        const startTime = new Date();
        const invSyncSession: Partial<InventorySyncSessionEntity> = {
          title: `Auto Sync - ${startTime}`,
          description: 'By schedule job',
          startedAt: startTime.toISOString(),
          status: InventorySyncOpResult.InProgress,
          createdBy: {
            id: 'SYSTEM',
            type: 'system',
            displayName: 'System'
          }
        };

        console.log(`fetching available fba inventory items...`);

        const fbaItems = await sellingPartner.getFbaInventoryItems();
        const fbaItemsBySku = new Map<string, FbaInventoryItem>(fbaItems.map(item => [item.sellerSku, item]));

        console.log(`total fba inventory items: ${fbaItems.length}.`);

        const skus = isTestMode ? testSkus : Array.from(fbaItemsBySku.keys());
        const locations = await storeLocationsCrud.getAll();
        console.log(JSON.stringify(locations));

        invSyncSession.locations = locations.map(loc => ({
          location: { id: loc.id, name: loc.name },
          operations: [],
          status: OperationStatus.InProgress,
          logs: []
        }));

        for (const location of locations) {
          const invSyncLocation = invSyncSession.locations.find(x => x.location.id == location.id);
          const supplySourceId = location.spSupplySourceId;
          const shopifyLocationId = location.shopifyLocationId;

          if (!supplySourceId || !shopifyLocationId) {
            invSyncLocation.status = OperationStatus.Skipped;
            logForLocation(invSyncLocation, `${location.name} - supplySourceId or shopifyLocationId not set.`);
            continue;
          }

          logForLocation(invSyncLocation, `${location.name} - Loading current inventory items`);
          const currentInventoryItems = await inventoryItemsCrud.getInventoryItemsByLocation(location.id);
          const currentInventoryItemsBySku = new Map<string, InventoryItemEntity>(
            currentInventoryItems.map(item => [item.sku, item])
          );

          logForLocation(
            invSyncLocation,
            `${location.name} - Loaded inventory items. Total: ${currentInventoryItems.length}`
          );

          for (const [index, sku] of skus.entries()) {
            if (sku.startsWith('Uncommingled') || sku.endsWith('-FBA')) {
              continue;
            }

            const invSyncOp: InventorySyncOp = {
              sku: sku,
              logs: [],
              oldQty: 0,
              newQty: 0,
              result: null,
              at: new Date().toISOString()
            };

            invSyncLocation.operations.push(invSyncOp);

            try {
              const getInventoryResponse = await shopifyClient.getInventoryInfo({
                sku,
                locationId: location.shopifyLocationId
              });
              const {
                variant: { id: variantId, title: variantTitle },
                product: { id: productId, title: productTitle, featuredImage: productImage },
                productInfo
              } = getInventoryResponse;

              let { quantityAvailable: shopifyQuantity } = getInventoryResponse;
              if (isTestMode && shopifyQuantity == 0) {
                shopifyQuantity = 20;
              }

              const inventoryItem = currentInventoryItemsBySku.get(sku);
              const currentQtyAvailable =
                (inventoryItem?.sellableQuantity ?? 0) + (inventoryItem?.reservedQuantity ?? 0);

              invSyncOp.oldQty = currentQtyAvailable;
              invSyncOp.newQty = shopifyQuantity;

              const fbaInventoryItem = fbaItemsBySku.get(sku);
              const productName = productTitle || fbaInventoryItem?.productName;

              const skip =
                inventoryItem &&
                inventoryItem.productName === productName &&
                inventoryItem.shopifyVariant &&
                inventoryItem.shopifyVariant.id === variantId &&
                inventoryItem.shopifyVariant.title === variantTitle &&
                inventoryItem.shopifyVariant.product?.id === productId &&
                inventoryItem.shopifyVariant.product?.title === productTitle &&
                inventoryItem.shopifyVariant.product?.featureImage === productImage &&
                shopifyQuantity == currentQtyAvailable;

              if (skip) {
                console.log(`${location.name} - Inventory ${sku} unchanged: ${shopifyQuantity}.`);
                invSyncOp.result = InventorySyncOpResult.Skipped;
                continue;
              }

              console.log(
                `${location.name} - Set inventory for ${sku} = ${shopifyQuantity}. (${index}/${skus.length})`
              );
              const updateResult = await sellingPartner.updateInventory({
                sku,
                supplySourceId,
                quantity: shopifyQuantity,
                timestamp: new Date().toUTCString()
              });

              invSyncOp.result = InventorySyncOpResult.Updated;

              const { sellableQuantity, reservedQuantity } = updateResult;

              await inventoryItemsCrud.upsert({
                location,
                sku,
                data: {
                  sku,
                  asin: fbaInventoryItem?.asin,
                  productName,
                  shopifyVariant: {
                    id: variantId,
                    title: variantTitle,
                    product: {
                      id: productId,
                      title: productTitle,
                      featureImage: productImage
                    }
                  },
                  sellableQuantity,
                  reservedQuantity,
                  bufferedQuantity: 0,
                  spEtag: '',
                  spVersion: new Date().toUTCString(),
                  storeLocation: {
                    id: location.id,
                    name: location.name,
                    spSupplySourceId: location.spSupplySourceId,
                    spSupplySourceCode: location.spSupplySourceCode,
                    shopifyDomain: location.shopifyDomain,
                    shopifyLocationId: location.shopifyLocationId
                  },
                  productInfo
                },
                createdBy: {
                  id: 'SYSTEM',
                  type: 'system',
                  displayName: 'System'
                }
              });
            } catch (e) {
              console.log(e);
              invSyncOp.result = InventorySyncOpResult.Failed;
              invSyncOp.logs.push({
                at: new Date().toISOString(),
                message: `Unable to sync inventory for ${sku} - ${e.mesage}`,
                details: e
              });
            }
          }

          invSyncLocation.status = OperationStatus.Completed;
        }

        invSyncSession.finishedAt = new Date().toISOString();
        invSyncSession.status = OperationStatus.Completed;

        console.log(invSyncSession);

        await inventorySyncSessionCrud.add(invSyncSession);

        console.log(`completed`);
      }
    }
  ]
});
