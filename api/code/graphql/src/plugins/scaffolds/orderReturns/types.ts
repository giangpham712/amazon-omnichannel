// If our GraphQL API uses Webiny Security Framework, we can retrieve the
// currently logged in identity and assign it to the `createdBy` property.
// https://www.webiny.com/docs/key-topics/security-framework/introduction
import { SecurityIdentity } from '@webiny/api-security/types';

export interface OrderReturnEntity {
  PK: string;
  SK: string;
  id: string;
  returnId: string;
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
  createdOn: string;
  savedOn: string;
  createdBy: Pick<SecurityIdentity, 'id' | 'displayName' | 'type'>;
  webinyVersion: string;
}
