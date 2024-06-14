import React from 'react';
import { ReactComponent as Icon } from './assets/round-ballot-24px.svg';
import { MenuPlugin } from '@webiny/app-admin/plugins/MenuPlugin';

/**
 * Registers "Inventory Items" main menu item.
 */
export default new MenuPlugin({
  render({ Menu, Item }) {
    return (
      <Menu name="menu-inventory" label={'Inventory'} icon={<Icon />}>
        <Item label={'Inventory Items'} path={'/inventory-items'} />
      </Menu>
    );
  }
});
