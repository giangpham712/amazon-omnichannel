import React from 'react';
import { SplitView, LeftPanel, RightPanel } from '@webiny/app-admin/components/SplitView';
import OrderReturnsDataList from './OrderReturnsDataList';
import OrderReturnsForm from './OrderReturnsForm';

/**
 * Main view component - renders data list and form.
 */

const OrderReturnsView: React.FC = () => {
  return (
    <SplitView>
      <LeftPanel>
        <OrderReturnsDataList />
      </LeftPanel>
      <RightPanel>
        <OrderReturnsForm />
      </RightPanel>
    </SplitView>
  );
};

export default OrderReturnsView;
