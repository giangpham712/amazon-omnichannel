import { useCallback, useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import { LIST_PENDING_ORDER_RETURNS_BY_RMA_ID } from './graphql';

export const useNewOrderReturnDialog = () => {
  const [] = useState([]);
  const [returns, setReturns] = useState([]);
  const [listPendingOrderReturnsByRmaId, { data, loading }] = useLazyQuery(LIST_PENDING_ORDER_RETURNS_BY_RMA_ID, {
    fetchPolicy: 'network-only'
  });

  useEffect(() => {
    setReturns(data?.orderReturns?.listPendingOrderReturnsByRmaId?.data || []);
  }, [data?.orderReturns?.listPendingOrderReturnsByRmaId?.data]);

  const listPendingOrderReturns = useCallback(
    async rmaId => {
      await listPendingOrderReturnsByRmaId({
        variables: {
          rmaId
        }
      });
    },
    [listPendingOrderReturnsByRmaId]
  );
  return {
    listPendingOrderReturns,
    loading,
    returns,
    setReturns
  };
};
