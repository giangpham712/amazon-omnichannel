import React, { memo, useEffect } from 'react';
import { Plugins } from '@webiny/app-admin-core';
import { AddMenu, AddRoute, Layout, NotFound } from '@webiny/app-admin';
import { plugins } from '@webiny/plugins';
import { ReactComponent as SettingsIcon } from '@webiny/app-admin/assets/icons/round-settings-24px.svg';

import adminPlugins from '@webiny/app-admin/plugins';

const BaseExtension: React.FC = () => {
  plugins.register(adminPlugins());

  return (
    <Plugins>
      <AddMenu name={'settings'} label={'Settings'} icon={<SettingsIcon />} pin={'last'} />
      <AddRoute path={'*'}>
        <Layout title={'Not Accessible'}>
          <NotFound />
        </Layout>
      </AddRoute>
    </Plugins>
  );
};

export const Base = memo(BaseExtension);
