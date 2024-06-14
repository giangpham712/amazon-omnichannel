import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { debounce } from 'lodash';
import { useRouter } from '@webiny/react-router';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar';
import { useConfirmationDialog } from '@webiny/app-admin/hooks/useConfirmationDialog';
import { PaginationProp } from '@webiny/ui/List/DataList/types';
import { LIST_ORDERS, DELETE_ORDER } from './graphql';
import { LIST_STORE_LOCATIONS } from '../../../storeLocations/views/hooks/graphql';
import { useSecurity } from '@webiny/app-serverless-cms';

/**
 * Contains essential data listing functionality - data querying and UI control.
 */

interface useOrdersDataListHook {
  (): {
    orders: Array<{
      id: string;
      title: string;
      description: string;
      createdOn: string;
      [key: string]: any;
    }>;
    loading: boolean;
    storeLocations: Array<{
      id: string;
      name: string;
      spSupplySourceId?: string;
      spSupplySourceCode?: string;
      shopifyDomain?: string;
      shopifyLocationId?: string;
    }>;
    pagination: PaginationProp;
    refresh: () => void;
    setSort: (sort: string) => void;
    searchKey: string | null;
    setSearchKey: (searchKey: string | null) => void;
    where: OrdersDataListWhereState;
    setWhere: (where: OrdersDataListWhereState) => void;
    newOrder: () => void;
    editOrder: (id: string) => void;
    deleteOrder: (id: string) => void;
    currentOrderId: string | null;
    loadMore: () => void;
    loadMoreLoading: boolean;
  };
}

export interface OrdersDataListWhereState {
  status?: string;
  shipmentLocationId?: string;
  archived?: boolean;
}

interface OrdersState {
  limit?: any;
  after?: any;
  before?: any;
  sort?: any;
  search: string | any;
  where: OrdersDataListWhereState;
}

const reducer = (prev: OrdersState, next: Partial<OrdersState>): OrdersState => ({ ...prev, ...next });

export const useOrdersDataList: useOrdersDataListHook = () => {
  // Base state and UI React hooks.
  const { history } = useRouter();
  const { showSnackbar } = useSnackbar();
  const { showConfirmation } = useConfirmationDialog();
  const [searchKey, setSearchKey] = useState<string | null>(null);

  const [variables, setVariables] = useReducer(reducer, {
    limit: 25,
    after: undefined,
    before: undefined,
    sort: 'createdOn_DESC',
    search: null,
    where: {}
  });

  const { getPermission } = useSecurity();
  const ordersPermission = useMemo(() => getPermission('orders'), [getPermission]);

  useEffect(() => {
    if (ordersPermission === null) {
      history.push('/');
    }
  }, []);

  const allowedStoreLocations = useMemo(() => ordersPermission?.storeLocations || [], [ordersPermission]);

  const hasFullAccess = useMemo(() => ordersPermission?.name === '*', [ordersPermission]);

  const [loadMoreLoading, setLoadMoreLoading] = useState<boolean>(false);

  const updateSearchQuery = useCallback(
    debounce(searchKey => {
      setVariables({ search: searchKey });
    }, 500),
    []
  );

  useEffect(() => {
    updateSearchQuery(searchKey);
  }, [updateSearchQuery, searchKey]);

  const searchParams = new URLSearchParams(location.search);
  const currentOrderId = searchParams.get('id') || null;

  // Queries and mutations.
  const listQuery = useQuery(LIST_ORDERS, {
    skip: !variables.where?.shipmentLocationId,
    variables,
    pollInterval: 5000,
    errorPolicy: 'ignore',
    onError: e => showSnackbar(e.message)
  });

  const [deleteIt, deleteMutation] = useMutation(DELETE_ORDER, {
    refetchQueries: [{ query: LIST_ORDERS }]
  });

  const { data: orders = [], meta = {} } = listQuery.loading ? {} : listQuery?.data?.orders?.listOrders || {};
  const loading = [listQuery, deleteMutation].some(item => item.loading);

  const listStoreLocationsQuery = useQuery(LIST_STORE_LOCATIONS, {
    variables,
    onError: e => showSnackbar(e.message)
  });

  const { data: storeLocations = [] } = listStoreLocationsQuery.loading
    ? {}
    : listStoreLocationsQuery?.data?.storeLocations?.listStoreLocations || {};

  useEffect(() => {
    if (
      storeLocations &&
      storeLocations.length > 0 &&
      (hasFullAccess || (allowedStoreLocations && allowedStoreLocations.length > 0))
    ) {
      let shipmentLocationId;
      if (hasFullAccess) {
        shipmentLocationId = storeLocations[0].spSupplySourceId;
      } else {
        shipmentLocationId = storeLocations.find(sl => sl.id === allowedStoreLocations[0].id)?.spSupplySourceId;
      }

      if (shipmentLocationId) {
        setVariables({
          where: {
            shipmentLocationId
          }
        });
      }
    }
  }, [storeLocations, hasFullAccess, allowedStoreLocations]);

  const loadMore = useCallback((): void => {
    if (meta.hasMoreItems && listQuery.fetchMore) {
      setLoadMoreLoading(true);
      listQuery
        .fetchMore({
          variables: {
            after: meta.cursor
          },
          updateQuery: (prev, result) => {
            if (!result || !result.fetchMoreResult) {
              return prev;
            }

            const fetchMoreResult = result.fetchMoreResult;

            const next = { ...fetchMoreResult };

            next.orders.listOrders.data = [...prev.orders.listOrders.data, ...fetchMoreResult.orders.listOrders.data];
            setLoadMoreLoading(false);
            return next;
          }
        })
        .catch(e => {
          console.log(`Error fetching more`, e);
        });
    }
  }, [meta, listQuery]);

  // Base CRUD actions - new, edit, and delete.
  const newOrder = useCallback(() => history.push('/orders?new'), [history]);
  const editOrder = useCallback(
    id => {
      history.push(`/orders?id=${id}`);
    },
    [history]
  );

  const deleteOrder = useCallback(
    item => {
      showConfirmation(async () => {
        try {
          await deleteIt({
            variables: item
          });

          showSnackbar(`Order "${item.shipmentId}" deleted.`);
          if (currentOrderId === item.id) {
            history.push(`/orders`);
          }
        } catch (e) {
          showSnackbar(e.message);
        }
      });
    },
    [showConfirmation, deleteIt, showSnackbar, history, currentOrderId]
  );

  // Sorting.
  const setSort = useCallback(value => setVariables({ after: undefined, before: undefined, sort: value }), []);

  // Pagination metadata and controls.
  const setPreviousPage = useCallback(() => setVariables({ after: undefined, before: meta.before }), [meta]);
  const setNextPage = useCallback(() => setVariables({ after: meta.cursor, before: undefined }), [meta]);
  const setLimit = useCallback(value => setVariables({ after: undefined, before: undefined, limit: value }), []);

  const pagination: PaginationProp = {
    setPerPage: setLimit,
    perPageOptions: [25, 50],
    setPreviousPage,
    setNextPage,
    hasPreviousPage: meta.before,
    hasNextPage: meta.hasMoreItems
  };

  return {
    orders,
    loading,
    storeLocations: hasFullAccess
      ? storeLocations
      : storeLocations.filter(location => allowedStoreLocations.map(s => s.id).includes(location.id)),
    refresh: listQuery.refetch,
    pagination,
    setSort,
    searchKey,
    setSearchKey,
    where: variables.where,
    setWhere: where => {
      setVariables({ where });
    },
    newOrder,
    editOrder,
    deleteOrder,
    currentOrderId,
    loadMore,
    loadMoreLoading
  };
};
