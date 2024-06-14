import React from 'react';
import { SplitView, LeftPanel, RightPanel } from '@webiny/app-admin/components/SplitView';
import StoreLocationsDataList from './StoreLocationsDataList';
import StoreLocationsForm from './StoreLocationsForm';

/**
 * Main view component - renders data list and form.
 */

const StoreLocationsView: React.FC = () => {
  return (
    <SplitView>
      <LeftPanel>
        <StoreLocationsDataList />
      </LeftPanel>
      <RightPanel>
        <StoreLocationsForm />
      </RightPanel>
    </SplitView>
  );
};

export default StoreLocationsView;
