import { useCallback, useReducer } from 'react';
import { useRouter } from '@webiny/react-router';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar';
import { useConfirmationDialog } from '@webiny/app-admin/hooks/useConfirmationDialog';
import { PaginationProp } from '@webiny/ui/List/DataList/types';
import { LIST_INVENTORY_SYNC_SESSIONS, DELETE_INVENTORY_SYNC_SESSION } from './graphql';

/**
 * Contains essential data listing functionality - data querying and UI control.
 */

interface useInventorySyncSessionsDataListHook {
  (): {
    inventorySyncSessions: Array<{
      id: string;
      title: string;
      description: string;
      createdOn: string;
      [key: string]: any;
    }>;
    loading: boolean;
    pagination: PaginationProp;
    refresh: () => void;
    setSort: (sort: string) => void;
    newInventorySyncSession: () => void;
    editInventorySyncSession: (id: string) => void;
    deleteInventorySyncSession: (id: string) => void;
    currentInventorySyncSessionId: string | null;
  };
}

interface InventorySyncSessionsState {
  limit?: any;
  after?: any;
  before?: any;
  sort?: any;
}

const reducer = (
  prev: InventorySyncSessionsState,
  next: Partial<InventorySyncSessionsState>
): InventorySyncSessionsState => ({ ...prev, ...next });

export const useInventorySyncSessionsDataList: useInventorySyncSessionsDataListHook = () => {
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
  const currentInventorySyncSessionId = searchParams.get('id') || null;

  // Queries and mutations.
  const listQuery = useQuery(LIST_INVENTORY_SYNC_SESSIONS, {
    variables,
    onError: e => showSnackbar(e.message)
  });

  const [deleteIt, deleteMutation] = useMutation(DELETE_INVENTORY_SYNC_SESSION, {
    refetchQueries: [{ query: LIST_INVENTORY_SYNC_SESSIONS }]
  });

  const { data: inventorySyncSessions = [], meta = {} } = listQuery.loading
    ? {}
    : listQuery?.data?.inventorySyncSessions?.listInventorySyncSessions || {};
  const loading = [listQuery, deleteMutation].some(item => item.loading);

  // Base CRUD actions - new, edit, and delete.
  const newInventorySyncSession = useCallback(() => history.push('/inventory-sync-sessions?new'), [history]);
  const editInventorySyncSession = useCallback(
    id => {
      history.push(`/inventory-sync-sessions?id=${id}`);
    },
    [history]
  );

  const deleteInventorySyncSession = useCallback(
    item => {
      showConfirmation(async () => {
        try {
          await deleteIt({
            variables: item
          });

          showSnackbar(`Inventory Sync Session "${item.title}" deleted.`);
          if (currentInventorySyncSessionId === item.id) {
            history.push(`/inventory-sync-sessions`);
          }
        } catch (e) {
          showSnackbar(e.message);
        }
      });
    },
    [showConfirmation, deleteIt, showSnackbar, history, currentInventorySyncSessionId]
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
    inventorySyncSessions,
    loading,
    refresh: listQuery.refetch,
    pagination,
    setSort,
    newInventorySyncSession,
    editInventorySyncSession,
    deleteInventorySyncSession,
    currentInventorySyncSessionId
  };
};
