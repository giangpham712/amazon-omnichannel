import { useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { useRouter } from '@webiny/react-router';
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar';
import {
  GET_INVENTORY_SYNC_SESSION,
  CREATE_INVENTORY_SYNC_SESSION,
  UPDATE_INVENTORY_SYNC_SESSION,
  LIST_INVENTORY_SYNC_SESSIONS
} from './graphql';

/**
 * Contains essential form functionality: data fetching, form submission, notifications, redirecting, and more.
 */

/**
 * Omits irrelevant values from the submitted form data (`id`, `createdOn`, `savedOn`, `createdBy`).
 * @param formData
 */
const getMutationData = (formData: Record<string, any>) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, createdOn, savedOn, createdBy, ...data } = formData;
  return data;
};

export const useInventorySyncSessionsForm = () => {
  const { location, history } = useRouter();
  const { showSnackbar } = useSnackbar();
  const searchParams = new URLSearchParams(location.search);
  const currentInventorySyncSessionId = searchParams.get('id');

  const getQuery = useQuery(GET_INVENTORY_SYNC_SESSION, {
    variables: { id: currentInventorySyncSessionId },
    skip: !currentInventorySyncSessionId,
    onError: error => {
      history.push('/inventory-sync-sessions');
      showSnackbar(error.message);
    }
  });

  const [create, createMutation] = useMutation(CREATE_INVENTORY_SYNC_SESSION, {
    refetchQueries: [{ query: LIST_INVENTORY_SYNC_SESSIONS }]
  });

  const [update, updateMutation] = useMutation(UPDATE_INVENTORY_SYNC_SESSION);

  const loading = [getQuery, createMutation, updateMutation].some(item => item.loading);

  const onSubmit = useCallback(
    async formData => {
      const { id } = formData;
      const data = getMutationData(formData);
      const [operation, options] = id ? [update, { variables: { id, data } }] : [create, { variables: { data } }];

      try {
        const result = await operation(options);
        if (!id) {
          const { id } = result.data.inventorySyncSessions.createInventorySyncSession;
          history.push(`/inventory-sync-sessions?id=${id}`);
        }

        showSnackbar('Inventory Sync Session saved successfully.');
      } catch (e) {
        showSnackbar(e.message);
      }
    },
    [create, history, showSnackbar, update]
  );

  const inventorySyncSession = getQuery?.data?.inventorySyncSessions?.getInventorySyncSession;
  const emptyViewIsShown = !searchParams.has('new') && !loading && !inventorySyncSession;
  const currentInventorySyncSession = useCallback(() => history.push('/inventory-sync-sessions?new'), [history]);
  const cancelEditing = useCallback(() => history.push('/inventory-sync-sessions'), [history]);

  return {
    loading,
    emptyViewIsShown,
    currentInventorySyncSession,
    cancelEditing,
    inventorySyncSession,
    onSubmit
  };
};
