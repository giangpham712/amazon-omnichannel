import React from 'react';
import { ReactComponent as Icon } from './assets/round-ballot-24px.svg';
import { MenuPlugin } from '@webiny/app-admin/plugins/MenuPlugin';

/**
 * Registers "Orders" main menu item.
 */
export default new MenuPlugin({
  render({ Menu, Item }) {
    return (
      <Menu name="menu-orders" label={'Orders'} icon={<Icon />}>
        <Item label={'Orders'} path={'/orders'} />
      </Menu>
    );
  }
});
