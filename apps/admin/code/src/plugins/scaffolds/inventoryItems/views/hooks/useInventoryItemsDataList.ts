import { useCallback, useEffect, useReducer, useState } from 'react';
import { uniqBy } from 'lodash';
import { useRouter } from '@webiny/react-router';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar';
import { useConfirmationDialog } from '@webiny/app-admin/hooks/useConfirmationDialog';
import { PaginationProp } from '@webiny/ui/List/DataList/types';
import { LIST_INVENTORY_ITEMS, DELETE_INVENTORY_ITEM } from './graphql';
import { debounce } from 'lodash';
import { LIST_STORE_LOCATIONS } from '../../../storeLocations/views/hooks/graphql';

/**
 * Contains essential data listing functionality - data querying and UI control.
 */

interface useInventoryItemsDataListHook {
  (): {
    inventoryItems: Array<{
      id: string;
      asin: string;
      sku: string;
      productName: string;
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
    where: InventoryItemsDataListWhereState;
    setWhere: (where: InventoryItemsDataListWhereState) => void;
    newInventoryItem: () => void;
    editInventoryItem: (id: string) => void;
    deleteInventoryItem: (id: string) => void;
    currentInventoryItemId: string | null;
    loadMore: () => void;
    loadMoreLoading: boolean;
  };
}

export interface InventoryItemsDataListWhereState {
  storeLocationId?: string;
}

interface InventoryItemsState {
  limit?: any;
  after?: any;
  before?: any;
  sort?: any;
  search: string | any;
  where: InventoryItemsDataListWhereState;
}

const reducer = (prev: InventoryItemsState, next: Partial<InventoryItemsState>): InventoryItemsState => ({
  ...prev,
  ...next
});

export const useInventoryItemsDataList: useInventoryItemsDataListHook = () => {
  // Base state and UI React hooks.
  const { history } = useRouter();
  const { showSnackbar } = useSnackbar();
  const { showConfirmation } = useConfirmationDialog();
  const [searchKey, setSearchKey] = useState<string | null>(null);
  const [variables, setVariables] = useReducer(reducer, {
    limit: 25,
    after: undefined,
    before: undefined,
    sort: undefined,
    search: null,
    where: {
      storeLocationId: null
    }
  });

  const [loadMoreLoading, setLoadMoreLoading] = useState<boolean>(false);

  const updateSearchQuery = useCallback(
    debounce(searchKey => {
      setVariables({ search: searchKey });
    }, 500),
    []
  );

  useEffect(() => {
    updateSearchQuery(searchKey);
  }, [searchKey, updateSearchQuery]);

  const searchParams = new URLSearchParams(location.search);
  const currentInventoryItemId = searchParams.get('id') || null;

  // Queries and mutations.

  const listStoreLocationsQuery = useQuery(LIST_STORE_LOCATIONS, {
    variables,
    onError: e => showSnackbar(e.message)
  });

  const { data: storeLocations = [] } = listStoreLocationsQuery.loading
    ? {}
    : listStoreLocationsQuery?.data?.storeLocations?.listStoreLocations || {};

  const listInventoryItemsQuery = useQuery(LIST_INVENTORY_ITEMS, {
    skip: !variables.where.storeLocationId,
    variables,
    onError: e => showSnackbar(e.message)
  });

  const [deleteIt, deleteMutation] = useMutation(DELETE_INVENTORY_ITEM, {
    refetchQueries: [{ query: LIST_INVENTORY_ITEMS }]
  });

  const { data: inventoryItems = [], meta = {} } = listInventoryItemsQuery.loading
    ? {}
    : listInventoryItemsQuery?.data?.inventoryItems?.listInventoryItems || {};
  const loading = [listInventoryItemsQuery, deleteMutation].some(item => item.loading);

  const loadMore = useCallback((): void => {
    if (meta.hasMoreItems && listInventoryItemsQuery?.fetchMore) {
      setLoadMoreLoading(true);
      listInventoryItemsQuery
        ?.fetchMore({
          variables: {
            after: meta.cursor
          },
          updateQuery: (prev, result) => {
            if (!result || !result.fetchMoreResult) {
              return prev;
            }

            const fetchMoreResult = result.fetchMoreResult;

            const next = { ...fetchMoreResult };

            next.inventoryItems.listInventoryItems.data = uniqBy(
              [
                ...prev.inventoryItems.listInventoryItems.data,
                ...fetchMoreResult.inventoryItems.listInventoryItems.data
              ],
              i => i.id
            );
            setLoadMoreLoading(false);
            return next;
          }
        })
        .catch(e => {
          console.log(`Error fetching more`, e);
        });
    }
  }, [setLoadMoreLoading, listInventoryItemsQuery, meta]);

  // Base CRUD actions - new, edit, and delete.
  const newInventoryItem = useCallback(() => history.push('/inventory-items?new'), [history]);
  const editInventoryItem = useCallback(
    id => {
      history.push(`/inventory-items?id=${id}`);
    },
    [history]
  );

  const deleteInventoryItem = useCallback(
    item => {
      showConfirmation(async () => {
        try {
          await deleteIt({
            variables: item
          });

          showSnackbar(`Inventory Item "${item.title}" deleted.`);
          if (currentInventoryItemId === item.id) {
            history.push(`/inventory-items`);
          }
        } catch (e) {
          showSnackbar(e.message);
        }
      });
    },
    [showConfirmation, deleteIt, showSnackbar, history, currentInventoryItemId]
  );

  // Sorting.
  const setSort = useCallback(value => setVariables({ after: undefined, before: undefined, sort: value }), []);

  // Pagination metadata and controls.
  const setPreviousPage = useCallback(() => setVariables({ after: undefined, before: meta.before }), [meta.before]);
  const setNextPage = useCallback(() => setVariables({ after: meta.after, before: undefined }), [meta.after]);
  const setLimit = useCallback(value => setVariables({ after: undefined, before: undefined, limit: value }), []);

  const pagination: PaginationProp = {
    setPerPage: setLimit,
    perPageOptions: [25, 50],
    setPreviousPage,
    setNextPage,
    hasPreviousPage: meta.before,
    hasNextPage: meta.after
  };

  return {
    inventoryItems,
    loading,
    storeLocations,
    refresh: listInventoryItemsQuery.refetch,
    pagination,
    setSort,
    searchKey,
    setSearchKey,
    where: variables.where,
    setWhere: where => {
      setVariables({ where });
    },
    newInventoryItem,
    editInventoryItem,
    deleteInventoryItem,
    currentInventoryItemId,
    loadMore,
    loadMoreLoading
  };
};
