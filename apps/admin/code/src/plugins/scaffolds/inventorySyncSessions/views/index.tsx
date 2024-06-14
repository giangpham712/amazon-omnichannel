import React from 'react';
import { SplitView, LeftPanel, RightPanel } from '@webiny/app-admin/components/SplitView';
import InventorySyncSessionsDataList from './InventorySyncSessionsDataList';
import InventorySyncSessionsForm from './InventorySyncSessionsForm';

/**
 * Main view component - renders data list and form.
 */

const InventorySyncSessionsView: React.FC = () => {
  return (
    <SplitView>
      <LeftPanel>
        <InventorySyncSessionsDataList />
      </LeftPanel>
      <RightPanel>
        <InventorySyncSessionsForm />
      </RightPanel>
    </SplitView>
  );
};

export default InventorySyncSessionsView;
