import React, { useEffect, useMemo } from 'react';
import { useRouter } from '@webiny/react-router';
import { useSecurity } from '@webiny/app-serverless-cms';
import { Dashboard } from '@webiny/app-admin';

const Home: React.FC = () => {
  const { getPermission } = useSecurity();
  const { history } = useRouter();

  const ordersPermission = useMemo(() => getPermission('orders'), [getPermission]);

  useEffect(() => {
    if (ordersPermission.name !== '*') {
      history.push('/orders');
    }
  }, [ordersPermission]);

  return <Dashboard />;
};

export default Home;
