import { useCallback, useReducer, useState } from 'react';
import { useRouter } from '@webiny/react-router';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar';
import { useConfirmationDialog } from '@webiny/app-admin/hooks/useConfirmationDialog';
import { PaginationProp } from '@webiny/ui/List/DataList/types';

import { LIST_ORDER_RETURNS, CREATE_ORDER_RETURN, LIST_INVENTORY_ITEMS } from './graphql';

/**
 * Contains essential data listing functionality - data querying and UI control.
 */

interface useOrderReturnsDataListHook {
  (): {
    orderReturns: Array<{
      id: string;
      title: string;
      description: string;
      createdOn: string;
      [key: string]: any;
    }>;
    inventoryItems: Array<{
      id: string;
      sku: string;
      productName: string;
      shopifyVariant: {
        id: string;
        title: string;
        product: {
          id: string;
          title: string;
          featureImage: string;
        };
      };
    }>;
    loading: boolean;
    pagination: PaginationProp;
    refresh: () => void;
    setSort: (sort: string) => void;
    showNewOrderReturnDialog: boolean;
    cancelNewOrderReturnDialog: () => void;
    processReturn: (returnId: string, itemConditions) => void;
    newOrderReturn: () => void;
    editOrderReturn: (id: string) => void;
    currentOrderReturnId: string | null;
  };
}

interface OrderReturnsState {
  limit?: any;
  after?: any;
  before?: any;
  sort?: any;
}

const reducer = (prev: OrderReturnsState, next: Partial<OrderReturnsState>): OrderReturnsState => ({
  ...prev,
  ...next
});

export const useOrderReturnsDataList: useOrderReturnsDataListHook = () => {
  // Base state and UI React hooks.
  const { history } = useRouter();
  const { showSnackbar } = useSnackbar();
  const { showConfirmation } = useConfirmationDialog();
  const [showNewOrderReturnDialog, setShowNewOrderReturnDialog] = useState<boolean>(false);
  const [variables, setVariables] = useReducer(reducer, {
    limit: undefined,
    after: undefined,
    before: undefined,
    sort: undefined
  });

  const searchParams = new URLSearchParams(location.search);
  const currentOrderReturnId = searchParams.get('id') || null;

  // Queries and mutations.
  const listQuery = useQuery(LIST_ORDER_RETURNS, {
    variables,
    onError: e => showSnackbar(e.message)
  });

  const [createOrderReturn, createOrderReturnMutation] = useMutation(CREATE_ORDER_RETURN, {
    refetchQueries: [{ query: LIST_ORDER_RETURNS }]
  });

  const { data: orderReturns = [], meta = {} } = listQuery.loading
    ? {}
    : listQuery?.data?.orderReturns?.listOrderReturns || {};
  const loading = [listQuery, createOrderReturnMutation].some(item => item.loading);

  const inventoryItemSkus = orderReturns?.map(orderReturn => orderReturn.merchantSku) || [];

  const listInventoryItemsQuery = useQuery(LIST_INVENTORY_ITEMS, {
    variables: {
      limit: inventoryItemSkus.length,
      sort: undefined,
      where: {
        skus: inventoryItemSkus
      }
    },
    skip: inventoryItemSkus.length === 0,
    onError: e => showSnackbar(e.message)
  });

  const { data: inventoryItems = [] } = listInventoryItemsQuery.loading
    ? {}
    : listInventoryItemsQuery?.data?.inventoryItems?.listInventoryItems || {};

  // Base CRUD actions - new, edit, and delete.
  const newOrderReturn = useCallback(() => {
    setShowNewOrderReturnDialog(true);
  }, [setShowNewOrderReturnDialog]);

  const cancelNewOrderReturn = useCallback(() => {
    setShowNewOrderReturnDialog(false);
  }, [setShowNewOrderReturnDialog]);

  const editOrderReturn = useCallback(
    id => {
      history.push(`/order-returns?id=${id}`);
    },
    [history]
  );

  const processReturn = useCallback(
    (returnId, itemConditions) => {
      showConfirmation(async () => {
        try {
          await createOrderReturn({
            variables: {
              returnId,
              itemConditions
            }
          });
        } catch (e) {
          showSnackbar(e.message);
        }
      });
    },
    [showConfirmation, createOrderReturn, showSnackbar]
  );

  // Sorting.
  const setSort = useCallback(value => setVariables({ after: undefined, before: undefined, sort: value }), []);

  // Pagination metadata and controls.
  const setPreviousPage = useCallback(() => setVariables({ after: undefined, before: meta.before }), [meta.before]);
  const setNextPage = useCallback(() => setVariables({ after: meta.after, before: undefined }), [meta.after]);
  const setLimit = useCallback(value => setVariables({ after: undefined, before: undefined, limit: value }), []);

  const pagination: PaginationProp = {
    setPerPage: setLimit,
    perPageOptions: [10, 25, 50],
    setPreviousPage,
    setNextPage,
    hasPreviousPage: meta.before,
    hasNextPage: meta.after
  };

  return {
    orderReturns,
    inventoryItems: inventoryItems || [],
    loading,
    refresh: listQuery.refetch,
    pagination,
    setSort,
    showNewOrderReturnDialog,
    cancelNewOrderReturnDialog: cancelNewOrderReturn,
    processReturn,
    newOrderReturn,
    editOrderReturn,
    currentOrderReturnId
  };
};
