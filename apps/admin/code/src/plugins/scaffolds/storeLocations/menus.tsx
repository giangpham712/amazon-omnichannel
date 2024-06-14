import React from 'react';
import { ReactComponent as Icon } from './assets/round-ballot-24px.svg';
import { MenuPlugin } from '@webiny/app-admin/plugins/MenuPlugin';

/**
 * Registers "Store Locations" main menu item.
 */
export default new MenuPlugin({
  render({ Menu, Item }) {
    return (
      <Menu name="menu-store-locations" label={'Store Locations'} icon={<Icon />}>
        <Item label={'Store Locations'} path={'/store-locations'} />
      </Menu>
    );
  }
});
