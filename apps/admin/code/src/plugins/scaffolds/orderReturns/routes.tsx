import React, { Suspense, lazy } from 'react';
import Helmet from 'react-helmet';
import { Route } from '@webiny/react-router';
import { CircularProgress } from '@webiny/ui/Progress';
import { AdminLayout } from '@webiny/app-admin/components/AdminLayout';
import { RoutePlugin } from '@webiny/app/plugins/RoutePlugin';

/**
 * Registers new "/order-returns" route.
 */

const Loader: React.FC = ({ children, ...props }) => (
  <Suspense fallback={<CircularProgress />}>{React.cloneElement(children as React.ReactElement, props)}</Suspense>
);

const OrderReturns = lazy(() => import('./views'));

export default new RoutePlugin({
  route: (
    <Route
      path={'/order-returns'}
      exact
      render={() => (
        <AdminLayout>
          <Helmet>
            <title>Returns</title>
          </Helmet>
          <Loader>
            <OrderReturns />
          </Loader>
        </AdminLayout>
      )}
    />
  )
});
