import { useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { useRouter } from '@webiny/react-router';
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar';
import { GET_INVENTORY_ITEM, CREATE_INVENTORY_ITEM, UPDATE_INVENTORY_ITEM, LIST_INVENTORY_ITEMS } from './graphql';

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

export const useInventoryItemsForm = () => {
  const { location, history } = useRouter();
  const { showSnackbar } = useSnackbar();
  const searchParams = new URLSearchParams(location.search);
  const currentInventoryItemId = searchParams.get('id');

  const getQuery = useQuery(GET_INVENTORY_ITEM, {
    variables: { id: currentInventoryItemId },
    skip: !currentInventoryItemId,
    onError: error => {
      history.push('/inventory-items');
      showSnackbar(error.message);
    }
  });

  const [create, createMutation] = useMutation(CREATE_INVENTORY_ITEM, {
    refetchQueries: [{ query: LIST_INVENTORY_ITEMS }]
  });

  const [update, updateMutation] = useMutation(UPDATE_INVENTORY_ITEM);

  const loading = [getQuery, createMutation, updateMutation].some(item => item.loading);

  const onSubmit = useCallback(
    async formData => {
      const { id } = formData;
      const data = getMutationData(formData);
      const [operation, options] = id ? [update, { variables: { id, data } }] : [create, { variables: { data } }];

      try {
        const result = await operation(options);
        if (!id) {
          const { id } = result.data.inventoryItems.createInventoryItem;
          history.push(`/inventory-items?id=${id}`);
        }

        showSnackbar('Inventory Item saved successfully.');
      } catch (e) {
        showSnackbar(e.message);
      }
    },
    [update, create, history, showSnackbar]
  );

  const inventoryItem = getQuery?.data?.inventoryItems?.getInventoryItem;
  const emptyViewIsShown = !searchParams.has('new') && !loading && !inventoryItem;
  const currentInventoryItem = useCallback(() => history.push('/inventory-items?new'), [history]);
  const cancelEditing = useCallback(() => history.push('/inventory-items'), [history]);

  return {
    loading,
    emptyViewIsShown,
    currentInventoryItem,
    cancelEditing,
    inventoryItem,
    onSubmit
  };
};
