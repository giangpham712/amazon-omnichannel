import React from 'react';
import { SplitView, LeftPanel, RightPanel } from '@webiny/app-admin/components/SplitView';
import InventoryItemsDataList from './InventoryItemsDataList';
import InventoryItemsForm from './InventoryItemsForm';

/**
 * Main view component - renders data list and form.
 */

const InventoryItemsView: React.FC = () => {
  return (
    <SplitView>
      <LeftPanel>
        <InventoryItemsDataList />
      </LeftPanel>
      <RightPanel>
        <InventoryItemsForm />
      </RightPanel>
    </SplitView>
  );
};

export default InventoryItemsView;
