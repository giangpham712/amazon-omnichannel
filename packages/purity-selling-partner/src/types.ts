export interface Pagination {
  nextToken: string | null;
}

export interface PaginatedShipments {
  shipments: SpExternalFulfillmentShipment[];
  pagination: Pagination;
}

export interface ExternalFulfillmentShipmentNotification {
  merchantId: string;
  locationId: string;
  channelName: string;
  shipmentId: string;
  shipmentStatus: string;
}

export interface SpExternalFulfillmentShipment {
  id: string;
  status: string;
  locationId: string;
  channelName: string;
  channelLocationId: string;
  metadata: SpExternalFulfillmentShipmentMetadata;
  lineItems: SpExternalFulfillmentShipmentLineItem[];
  packages: SpExternalFulfillmentShipmentPackage[];
  shippingInfo: SpExternalFulfillmentShipmentShippingInfo;
  charges: SpExternalFulfillmentShipmentCharge[]
  creationDateTime: string;
  lastUpdatedDateTime: string;
}

export interface SpExternalFulfillmentShipmentCharge {
  totalTax: { charge: SpChargeAmount, type: string },
  totalCharge: SpChargeAmount,
  baseCharge: SpChargeAmount,
  chargeType: string
}

export interface SpChargeAmount {
  netAmount?: MoneyAmount,
  discountAmount?: MoneyAmount,
  baseAmount?: MoneyAmount
}

export interface MoneyAmount {
  value: number,
  currency: string
}

export enum ShipmentStatus {
  Accepted = 'ACCEPTED',
  Confirmed = 'CONFIRMED',
  PackageCreated = 'PACKAGE_CREATED',
  PickupSlotRetrieved = 'PICKUP_SLOT_RETRIEVED',
  InvoiceGenerated = 'INVOICE_GENERATED',
  ShipLabelGenerated = 'SHIPLABEL_GENERATED',
  Cancelled = 'CANCELLED',
  Shipped = 'SHIPPED',
  Delivered = 'DELIVERED'
}

export interface SpExternalFulfillmentShipmentMetadata {
  numberOfUnits: number;
  buyerOrderId: string;
  priority: boolean;
  shipmentType: string;
}

export interface SpExternalFulfillmentShipmentLineItem {
  id: string;
  merchantSku: string;
  numberOfUnits: number;
  serialNumberRequired: boolean;
  hazmatLabelsRequired: boolean;
  giftAttributes: {
    giftWrapRequired: boolean;
    giftMessagePresent: boolean;
  };
  charges: SpExternalFulfillmentShipmentCharge[];
}

export interface SpExternalFulfillmentShipmentPackage {
  id: string;
  dimensions: {
    length: {
      value: string;
      dimensionUnit: string;
    };
    width: {
      value: string;
      dimensionUnit: string;
    };
    height: {
      value: string;
      dimensionUnit: string;
    };
  };
  weight: {
    value: string;
    weightUnit: string;
  };
  hazmatLabels: Array<any>;
  packageLineItems: Array<{
    packageLineItem: {
      id: string;
    };
    quantity: number;
    serialNumbers: Array<any>;
  }>;
  status: string;
}

export interface SpExternalFulfillmentShipmentShippingInfo {
  recommendedShipMethod: string;
  expectedShippingDateTime: string;
  shipToAddress: SpAddress;
}

export interface SpAddress {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  state: string;
  district: string;
  postalCode: string;
  countryCode: string;
  phoneNumber: string;
}

export interface SpReturn {
  marketplaceChannelDetails: {
    channelSku: string;
    customerOrderId: string;
    merchantId: string;
    returnLocationId: string;
    shipmentId: string;
    marketplaceChannel: {
      marketplaceName: string;
      channelName: string;
    };
  };
  creationDateTime: string;
  lastUpdatedDateTime: string;
  fulfillmentLocationId: string;
  id: string;
  merchantSku: string;
  numberOfUnits: number;
  returnMetadata: {
    invoiceInformation: {
      id: string;
    };
    returnReason: string;
    rmaId: string;
    fulfillmentOrderId: string;
  };
  returnShippingInfo: {
    forwardTrackingInfo: {
      carrierName: string;
      trackingId: string;
    };
    reverseTrackingInfo: {
      carrierName: string;
      trackingId: string;
    };
  };
  returnType: string;
  status: string;
}

export interface FbaInventoryItem {
  asin: string;
  fnSku: string;
  sellerSku: string;
  condition: string;
  lastUpdatedTime: string;
  productName: string;
  totalQuantity: number;
}

export interface UpdateInventoryRequestParams {
  supplySourceId: string;
  sku: string;
  quantity: number;
  timestamp: string;
}

export interface UpdateInventoryResult {
  reservedQuantity: number;
  sellableQuantity: number;
  marketplaceChannelInventories: MarketplaceChannelInventory[];
}

export interface MarketplaceChannelInventory {
  bufferedQuantity: string;
  sellableQuantity: number;
  marketplaceAttributes: Record<string, string | number | boolean>;
}

export interface SellingPartnerParams {
  useSandbox: boolean;
  credentials: {
    SELLING_PARTNER_APP_CLIENT_ID: string;
    SELLING_PARTNER_APP_CLIENT_SECRET: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;

    AWS_SELLING_PARTNER_ROLE: string;
  };
  refreshToken: string;
}

export interface SellingPartner {
  getShipment(shipmentId: string): Promise<SpExternalFulfillmentShipment>;
  listShipments(
    locationId: string,
    status: string,
    fromTime?: Date,
    toTime?: Date,
    maxResults?: number,
    nextToken?: string | null
  ): Promise<PaginatedShipments>;
  confirmShipment(shipmentId: string): Promise<SpExternalFulfillmentShipment>;
  rejectShipment(shipmentId: string, lineItems): Promise<SpExternalFulfillmentShipment>;
  getFbaInventoryItems(since?: Date, marketplaceIds?: string[]): Promise<FbaInventoryItem[]>;
  updateInventory(params: UpdateInventoryRequestParams): Promise<UpdateInventoryResult>;
  createPackages(shipmentId: string, packages: Partial<SpExternalFulfillmentShipmentPackage>[]): Promise<any>;
  retrieveShippingOptions(shipmentId: string, packageId: string): Promise<any>;
  generateInvoice(shipmentId: string, packageId: string): Promise<any>;
  generateShippingLabel(shipmentId: string, packageId: string): Promise<any>;
  getShippingLabel(shipmentId: string, packageId: string): Promise<any>;
  getInvoice(shipmentId: string, packageId: string): Promise<any>;
  shipComplete(shipmentId: string, packageId: string): Promise<any>;
  listReturns(rmaId: string): Promise<{ returns: SpReturn[] }>;
  getReturn(returnId: string): Promise<SpReturn>;
  processReturn(
    returnId: string,
    itemConditions: {
      sellable?: number;
      defective?: number;
      customerDamaged?: number;
      carrierDamaged?: number;
      fraud?: number;
      wrongItem?: number;
    }
  ): Promise<any>;
}
