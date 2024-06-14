import React from 'react';
import { ButtonDefault, ButtonPrimary, ButtonSecondary } from '@webiny/ui/Button';

export interface OrderActionsProps {
  order: any;
  onCancel: () => void;
  setShowCreatePackages: (showCreatePackages: boolean) => void;
  onRetrieveShippingOptions: () => Promise<void>;
  onGenerateShippingLabel: () => Promise<void>;
  onGenerateInvoice: () => Promise<void>;
  onRefreshOrder: () => Promise<void>;
  onConfirmOrder: () => Promise<void>;
  onRejectOrder: () => Promise<void>;
  onShipComplete: () => Promise<void>;
}

const OrderActions: React.FC<OrderActionsProps> = ({
  order,
  onCancel,
  setShowCreatePackages,
  onRetrieveShippingOptions,
  onGenerateShippingLabel,
  onGenerateInvoice,
  onRefreshOrder,
  onConfirmOrder,
  onRejectOrder,
  onShipComplete
}: OrderActionsProps) => {
  const customerPickup = order?.shippingInfo?.recommendedShipMethod === 'AMZL_US_SP_PICKUP';

  return (
    <>
      <ButtonDefault onClick={onCancel}>Cancel</ButtonDefault>
      &nbsp;&nbsp;
      {order.status === 'INVOICE_GENERATED' && (
        <>
          <ButtonSecondary onClick={onGenerateShippingLabel}>Generate Ship Label</ButtonSecondary>
          &nbsp;&nbsp;
        </>
      )}
      {order.status === 'CONFIRMED' && (
        <>
          <ButtonSecondary onClick={() => setShowCreatePackages(true)}>Create Package</ButtonSecondary>
          &nbsp;&nbsp;
        </>
      )}
      {order.status === 'PACKAGE_CREATED' && (
        <>
          <ButtonSecondary onClick={onRetrieveShippingOptions}>Retrieve Shipping Options</ButtonSecondary>
          &nbsp;&nbsp;
        </>
      )}
      {order.status === 'PICKUP_SLOT_RETRIEVED' && (
        <>
          <ButtonSecondary onClick={onGenerateInvoice}>Generate Invoice</ButtonSecondary>
          &nbsp;&nbsp;
        </>
      )}
      <ButtonSecondary onClick={onRefreshOrder}>Refresh</ButtonSecondary>
      {!['CANCELLED', 'SHIPPED', 'DELIVERED', 'SHIPLABEL_GENERATED'].includes(order.status) && (
        <>
          &nbsp;&nbsp;
          <ButtonSecondary onClick={onRejectOrder}>Reject</ButtonSecondary>
        </>
      )}
      {order.status === 'ACCEPTED' && (
        <>
          &nbsp;&nbsp;
          <ButtonPrimary onClick={onConfirmOrder}>Confirm</ButtonPrimary>
        </>
      )}
      {customerPickup && order.status === 'SHIPLABEL_GENERATED' && (
        <>
          &nbsp;&nbsp;
          <ButtonPrimary onClick={onShipComplete}>Pick Up</ButtonPrimary>
        </>
      )}
    </>
  );
};

export default OrderActions;
