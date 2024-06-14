import { SecurityIdentity } from '@webiny/api-security/types';
import { CreateOrderParams } from './crud';

export interface Order {
  PK: string;
  SK: string;
  id: string;
  shipmentId: string;
  shipmentLocationId: string;
  channelName: string;
  channelLocationId: string;
  metadata: OrderMetadata;
  status: string;
  lineItems: OrderLineItem[];
  packages: OrderPackage[];
  charges: ChargeLineItem[];
  shippingInfo: OrderShippingInfo;
  shopifyOrder: ShopifyOrderInfo;
  creationDateTime: string;
  lastUpdatedDateTime: string;
  createdOn: string;
  savedOn: string;
  createdBy: Pick<SecurityIdentity, 'id' | 'displayName' | 'type'>;
  archived?: boolean;
  webinyVersion: string;
}

export interface ChargeLineItem {
  totalTax: { charge: ChargeAmount; type: string };
  totalCharge: ChargeAmount;
  baseCharge: ChargeAmount;
  chargeType: string;
}

export interface ChargeAmount {
  netAmount?: MoneyAmount;
  discountAmount?: MoneyAmount;
  baseAmount?: MoneyAmount;
}

export interface MoneyAmount {
  value: number;
  currency: string;
}

export interface OrderMetadata {
  numberOfUnits: number;
  buyerOrderId: string;
  priority: boolean;
  shipmentType: string;
}

export interface OrderLineItem {
  id: string;
  merchantSku: string;
  numberOfUnits: number;
  charges?: ChargeLineItem[];
}

export interface OrderPackage {
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
  shippingLabel: OrderPackageShippingLabel;
  invoice: OrderPackageInvoice;
}

export interface OrderPackageShippingLabel {
  document: OrderDocument;
  metadata: any;
}

export interface OrderPackageInvoice {
  document: OrderDocument;
}

export interface OrderDocument {
  format: string;
  content: string;
}

export interface OrderShippingInfo {
  recommendedShipMethod: string;
  expectedShippingDateTime: string;
  shipToAddress: Address;
}

export interface Address {
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

export interface ShopifyOrderInfo {
  orderId: number;
  orderNumber: string;
  shopifyDomain: string;
}

export interface OrdersCrud {
  getOrderById: (id: string) => Promise<Order>;
  getOrderByShipmentId: (shipmentId: string) => Promise<Order>;
  createOrder: (createOrderParams: CreateOrderParams) => Promise<Order>;
  updateOrder: (
    id: string,
    orderUpdate: Partial<
      Pick<
        Order,
        | 'status'
        | 'lineItems'
        | 'packages'
        | 'shipmentLocationId'
        | 'shopifyOrder'
        | 'shippingInfo'
        | 'creationDateTime'
        | 'lastUpdatedDateTime'
      >
    >
  ) => Promise<Order>;
}
