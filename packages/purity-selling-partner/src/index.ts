import mdbid from 'mdbid';
import SellingPartnerAPI from './lib';
import {
  FbaInventoryItem,
  SpExternalFulfillmentShipmentPackage,
  SellingPartner,
  SellingPartnerParams,
  SpExternalFulfillmentShipment,
  UpdateInventoryResult,
  PaginatedShipments,
  SpReturn
} from './types';

const Marketplace = {
  US: 'ATVPDKIKX0DER',
  CA: 'A2EUQ1WTGCTBG2'
};

export * from './types';

export const createSellingPartner = ({
  useSandbox,
  credentials,
  refreshToken
}: SellingPartnerParams): SellingPartner => {
  const sellingPartnerApi = new SellingPartnerAPI({
    region: 'na', // The region to use for the SP-API endpoints ("eu", "na" or "fe")
    credentials,
    options: {
      only_grantless_operations: false,
      use_sandbox: useSandbox
    },
    refresh_token: refreshToken
  });

  const sellingPartner: SellingPartner = {
    async getShipment(shipmentId: string): Promise<SpExternalFulfillmentShipment> {
      const shipment = await sellingPartnerApi.callAPI({
        // @ts-ignore
        api_path: `/externalFulfillment/shipments/2021-01-06/shipments/${shipmentId}`,
        method: 'GET'
      });

      return shipment;
    },

    async listShipments(
      locationId: string,
      status: string,
      fromTime?: Date,
      toTime?: Date,
      maxResults = 10,
      nextToken?: string | null
    ): Promise<PaginatedShipments> {
      const query: {
        locationId: string;
        status: string;
        maxResults: number;
        nextToken: string | null | undefined;
        lastUpdatedAfter?: string | null | undefined;
        lastUpdatedBefore?: string | null | undefined;
      } = {
        locationId,
        status,
        maxResults,
        nextToken
      };

      if (fromTime) {
        query.lastUpdatedAfter = fromTime.toISOString();
      }

      if (toTime) {
        query.lastUpdatedBefore = toTime.toISOString();
      }

      return await sellingPartnerApi.callAPI({
        // @ts-ignore
        api_path: `/externalFulfillment/shipments/2021-01-06/shipments`,
        method: 'GET',
        query
      });
    },

    async confirmShipment(shipmentId: string) {
      return await sellingPartnerApi.callAPI({
        // @ts-ignore
        api_path: `/externalFulfillment/shipments/2021-01-06/shipments/${shipmentId}`,
        method: 'POST',
        query: {
          operation: 'CONFIRM'
        },
        body: null,
        version: 'v0'
      });
    },

    async rejectShipment(shipmentId: string, lineItems) {
      console.log('rejectShipment', {
        referenceId: 'cancellation-reference-identifier1',
        lineItems
      });

      return await sellingPartnerApi.callAPI({
        // @ts-ignore
        api_path: `/externalFulfillment/shipments/2021-01-06/shipments/${shipmentId}`,
        method: 'POST',
        query: {
          operation: 'REJECT'
        },
        body: {
          referenceId: 'cancellation-reference-identifier1',
          lineItems
        },
        version: 'v0'
      });
    },

    async getFbaInventoryItems(since?: Date, marketplaceIds?: string[]) {
      const getDefaultStartDateTime = () => {
        const startDateTime = since ?? new Date();
        startDateTime.setDate(startDateTime.getDate() - 30);
        return startDateTime;
      };

      const allInventoryItems: FbaInventoryItem[] = [];
      let nextToken = '';

      do {
        const response = await sellingPartnerApi.callAPI({
          endpoint: 'fbaInventory',
          operation: 'getInventorySummaries',
          query: {
            granularityType: 'Marketplace',
            marketplaceIds: marketplaceIds ?? [Marketplace.US],
            granularityId: Marketplace.US,
            startDateTime: (since ?? getDefaultStartDateTime()).toISOString(),
            nextToken
          }
        });

        allInventoryItems.push(
          ...response.inventorySummaries.map(obj => ({
            asin: obj.asin,
            fnSku: obj.fnSku,
            sellerSku: obj.sellerSku,
            condition: obj.condition,
            lastUpdatedTime: obj.lastUpdatedTime,
            productName: obj.productName,
            totalQuantity: obj.totalQuantity
          }))
        );

        nextToken = response.nextToken;
      } while (nextToken);

      return allInventoryItems;
    },

    async updateInventory({ quantity, sku, supplySourceId, timestamp }): Promise<UpdateInventoryResult> {
      return await sellingPartnerApi.callAPI({
        method: 'PUT',
        api_path: `/externalFulfillment/inventory/2021-01-06/locations/${supplySourceId}/skus/${sku}`,
        query: { quantity },
        headers: {
          // 'If-Match': 1,
          'If-Unmodified-Since': timestamp || new Date().toUTCString()
        }
      });
    },

    async createPackages(shipmentId: string, packages: Partial<SpExternalFulfillmentShipmentPackage>[]): Promise<any> {
      return await sellingPartnerApi.callAPI({
        // @ts-ignore
        api_path: `/externalFulfillment/shipments/2021-01-06/shipments/${shipmentId}/packages`,
        method: 'POST',
        body: {
          packages
        }
      });
    },

    async retrieveShippingOptions(shipmentId: string, packageId: string): Promise<any> {
      return await sellingPartnerApi.callAPI({
        // @ts-ignore
        api_path: `/externalFulfillment/shipments/2021-01-06/shippingOptions`,
        method: 'GET',
        query: {
          shipmentId,
          packageId
        }
      });
    },

    async generateInvoice(shipmentId: string, packageId: string): Promise<any> {
      return await sellingPartnerApi.callAPI({
        // @ts-ignore
        api_path: `/externalFulfillment/shipments/2021-01-06/shipments/${shipmentId}/packages/${packageId}/invoice`,
        method: 'POST',
        body: null
      });
    },

    async generateShippingLabel(shipmentId: string, packageId: string): Promise<any> {
      return await sellingPartnerApi.callAPI({
        // @ts-ignore
        api_path: `/externalFulfillment/shipments/2021-01-06/shipments/${shipmentId}/packages/${packageId}/shipLabel`,
        method: 'POST',
        query: {
          operation: 'GENERATE'
        },
        body: null
      });
    },

    async getShippingLabel(shipmentId: string, packageId: string): Promise<any> {
      return await sellingPartnerApi.callAPI({
        // @ts-ignore
        api_path: `/externalFulfillment/shipments/2021-01-06/shipments/${shipmentId}/packages/${packageId}/shipLabel`,
        method: 'GET'
      });
    },

    async getInvoice(shipmentId: string, packageId: string): Promise<any> {
      return await sellingPartnerApi.callAPI({
        // @ts-ignore
        api_path: `/externalFulfillment/shipments/2021-01-06/shipments/${shipmentId}/packages/${packageId}/invoice`,
        method: 'GET'
      });
    },

    async shipComplete(shipmentId: string, packageId: string) {
      return await sellingPartnerApi.callAPI({
        // @ts-ignore
        api_path: `/externalFulfillment/shipments/2021-01-06/shipments/${shipmentId}/packages/${packageId}`,
        method: 'PATCH',
        query: {
          status: 'SHIPPED'
        },
        body: null
      });
    },

    async listReturns(rmaId: string): Promise<{ returns: SpReturn[] }> {
      return await sellingPartnerApi.callAPI({
        // @ts-ignore
        api_path: `/externalFulfillment/returns/2021-08-19/returns`,
        method: 'GET',
        query: {
          rmaId: rmaId
        },
        body: null
      });
    },

    async getReturn(returnId: string): Promise<SpReturn> {
      return await sellingPartnerApi.callAPI({
        // @ts-ignore
        api_path: `/externalFulfillment/returns/2021-08-19/returns/${returnId}`,
        method: 'GET',
        body: null
      });
    },

    async processReturn(
      returnId: string,
      itemConditions: {
        sellable?: number;
        defective?: number;
        customerDamaged?: number;
        carrierDamaged?: number;
        fraud?: number;
        wrongItem?: number;
      }
    ): Promise<any> {
      return await sellingPartnerApi.callAPI({
        // @ts-ignore
        api_path: `/externalFulfillment/returns/2021-08-19/returns/${returnId}`,
        method: 'PATCH',
        body: {
          op: 'increment',
          path: '/processedReturns',
          value: {
            Sellable: itemConditions.sellable,
            Defective: itemConditions.defective,
            CustomerDamaged: itemConditions.customerDamaged,
            CarrierDamaged: itemConditions.carrierDamaged,
            Fraud: itemConditions.fraud,
            WrongItem: itemConditions.wrongItem
          }
        },
        headers: {
          // 'If-Match': 1,
          'x-amzn-idempotency-token': mdbid()
        }
      });
    }
  };

  return sellingPartner;
};
