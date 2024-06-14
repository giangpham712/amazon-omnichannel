import { useCallback, useReducer } from 'react';
import { useRouter } from '@webiny/react-router';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar';
import { useConfirmationDialog } from '@webiny/app-admin/hooks/useConfirmationDialog';
import { PaginationProp } from '@webiny/ui/List/DataList/types';
import { LIST_STORE_LOCATIONS, DELETE_STORE_LOCATION } from './graphql';

/**
 * Contains essential data listing functionality - data querying and UI control.
 */

interface useStoreLocationsDataListHook {
  (): {
    storeLocations: Array<{
      id: string;
      name: string;
      storeAdminEmail: string;
      spSupplySourceId: string;
      spSupplySourceCode: string;
      shopifyDomain: string;
      shopifyLocationId: string;
      createdOn: string;
      [key: string]: any;
    }>;
    loading: boolean;
    pagination: PaginationProp;
    refresh: () => void;
    setSort: (sort: string) => void;
    newStoreLocation: () => void;
    editStoreLocation: (id: string) => void;
    deleteStoreLocation: (id: string) => void;
    currentStoreLocationId: string | null;
  };
}

interface StoreLocationsState {
  limit?: any;
  after?: any;
  before?: any;
  sort?: any;
}

const reducer = (prev: StoreLocationsState, next: Partial<StoreLocationsState>): StoreLocationsState => ({
  ...prev,
  ...next
});

export const useStoreLocationsDataList: useStoreLocationsDataListHook = () => {
  // Base state and UI React hooks.
  const { history } = useRouter();
  const { showSnackbar } = useSnackbar();
  const { showConfirmation } = useConfirmationDialog();
  const [variables, setVariables] = useReducer(reducer, {
    limit: undefined,
    after: undefined,
    before: undefined,
    sort: undefined
  });

  const searchParams = new URLSearchParams(location.search);
  const currentStoreLocationId = searchParams.get('id') || null;

  // Queries and mutations.
  const listQuery = useQuery(LIST_STORE_LOCATIONS, {
    variables,
    onError: e => showSnackbar(e.message)
  });

  const [deleteIt, deleteMutation] = useMutation(DELETE_STORE_LOCATION, {
    refetchQueries: [{ query: LIST_STORE_LOCATIONS }]
  });

  const { data: storeLocations = [], meta = {} } = listQuery.loading
    ? {}
    : listQuery?.data?.storeLocations?.listStoreLocations || {};
  const loading = [listQuery, deleteMutation].some(item => item.loading);

  // Base CRUD actions - new, edit, and delete.
  const newStoreLocation = useCallback(() => history.push('/store-locations?new'), [history]);
  const editStoreLocation = useCallback(
    id => {
      history.push(`/store-locations?id=${id}`);
    },
    [history]
  );

  const deleteStoreLocation = useCallback(
    item => {
      showConfirmation(async () => {
        try {
          await deleteIt({
            variables: item
          });

          showSnackbar(`Store Location "${item.title}" deleted.`);
          if (currentStoreLocationId === item.id) {
            history.push(`/store-locations`);
          }
        } catch (e) {
          showSnackbar(e.message);
        }
      });
    },
    [showConfirmation, deleteIt, showSnackbar, history, currentStoreLocationId]
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
    storeLocations,
    loading,
    refresh: listQuery.refetch,
    pagination,
    setSort,
    newStoreLocation,
    editStoreLocation,
    deleteStoreLocation,
    currentStoreLocationId
  };
};
