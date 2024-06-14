import React, { Suspense, lazy } from 'react';
import Helmet from 'react-helmet';
import { Route } from '@webiny/react-router';
import { CircularProgress } from '@webiny/ui/Progress';
import { AdminLayout } from '@webiny/app-admin/components/AdminLayout';
import { RoutePlugin } from '@webiny/app/plugins/RoutePlugin';

/**
 * Registers new "/inventory-sync-sessions" route.
 */

const Loader: React.FC = ({ children, ...props }) => (
  <Suspense fallback={<CircularProgress />}>{React.cloneElement(children as React.ReactElement, props)}</Suspense>
);

const InventorySyncSessions = lazy(() => import('./views'));

export default new RoutePlugin({
  route: (
    <Route
      path={'/inventory-sync-sessions'}
      exact
      render={() => (
        <AdminLayout>
          <Helmet>
            <title>Inventory Sync Sessions</title>
          </Helmet>
          <Loader>
            <InventorySyncSessions />
          </Loader>
        </AdminLayout>
      )}
    />
  )
});
