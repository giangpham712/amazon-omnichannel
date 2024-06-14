import React from 'react';
import { ReactComponent as Icon } from './assets/round-ballot-24px.svg';
import { MenuPlugin } from '@webiny/app-admin/plugins/MenuPlugin';

/**
 * Registers "Order Returns" main menu item.
 */
export default new MenuPlugin({
  render({ Menu, Item }) {
    return (
      <Menu name="menu-order-returns" label={'Returns'} icon={<Icon />}>
        <Item label={'Returns'} path={'/order-returns'} />
      </Menu>
    );
  }
});
