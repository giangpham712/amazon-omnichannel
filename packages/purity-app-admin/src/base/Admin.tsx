import React from 'react';
import { Admin as BaseAdmin, Provider } from '@webiny/app-admin-core';
import { ApolloClientFactory, createApolloProvider } from '@webiny/app-admin/base/providers/ApolloProvider';
import { Base } from './Base';
import { createTelemetryProvider } from '@webiny/app-admin/base/providers/TelemetryProvider';
import { createUiStateProvider } from '@webiny/app-admin/base/providers/UiStateProvider';
import { SearchProvider } from '@webiny/app-admin/base/ui/Search';
import { UserMenuProvider } from '@webiny/app-admin/base/ui/UserMenu';
import { NavigationProvider } from '@webiny/app-admin/base/ui/Navigation';

export interface AdminProps {
  createApolloClient: ApolloClientFactory;
  children?: React.ReactNode;
}

export const Admin: React.FC<AdminProps> = ({ children, createApolloClient }) => {
  const ApolloProvider = createApolloProvider(createApolloClient);
  const TelemetryProvider = createTelemetryProvider();
  const UiStateProvider = createUiStateProvider();
  /**
   * TODO @ts-refactor
   */
  return (
    <BaseAdmin>
      <Provider hoc={ApolloProvider} />
      <Provider hoc={TelemetryProvider} />
      <Provider hoc={UiStateProvider} />
      <Provider hoc={SearchProvider} />
      <Provider hoc={UserMenuProvider} />
      <Provider hoc={NavigationProvider} />
      <Base />
      {children}
    </BaseAdmin>
  );
};
