import React from 'react';
import { SplitView, LeftPanel, RightPanel } from '@webiny/app-admin/components/SplitView';
import OrdersDataList from './OrdersDataList';
import OrdersForm from './OrdersForm';

/**
 * Main view component - renders data list and form.
 */

const OrdersView: React.FC = () => {
  return (
    <SplitView>
      <LeftPanel>
        <OrdersDataList />
      </LeftPanel>
      <RightPanel>
        <OrdersForm />
      </RightPanel>
    </SplitView>
  );
};

export default OrdersView;
