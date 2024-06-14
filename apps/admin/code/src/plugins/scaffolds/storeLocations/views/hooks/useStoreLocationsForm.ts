import { useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { useRouter } from '@webiny/react-router';
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar';
import { GET_STORE_LOCATION, CREATE_STORE_LOCATION, UPDATE_STORE_LOCATION, LIST_STORE_LOCATIONS } from './graphql';

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

export const useStoreLocationsForm = () => {
  const { location, history } = useRouter();
  const { showSnackbar } = useSnackbar();
  const searchParams = new URLSearchParams(location.search);
  const currentStoreLocationId = searchParams.get('id');

  const getQuery = useQuery(GET_STORE_LOCATION, {
    variables: { id: currentStoreLocationId },
    skip: !currentStoreLocationId,
    onError: error => {
      history.push('/store-locations');
      showSnackbar(error.message);
    }
  });

  const [create, createMutation] = useMutation(CREATE_STORE_LOCATION, {
    refetchQueries: [{ query: LIST_STORE_LOCATIONS }]
  });

  const [update, updateMutation] = useMutation(UPDATE_STORE_LOCATION);

  const loading = [getQuery, createMutation, updateMutation].some(item => item.loading);

  const onSubmit = useCallback(
    async formData => {
      const { id } = formData;
      const data = getMutationData(formData);
      const [operation, options] = id ? [update, { variables: { id, data } }] : [create, { variables: { data } }];

      try {
        const result = await operation(options);
        if (!id) {
          const { id } = result.data.storeLocations.createStoreLocation;
          history.push(`/store-locations?id=${id}`);
        }

        showSnackbar('Store Location saved successfully.');
      } catch (e) {
        showSnackbar(e.message);
      }
    },
    [update, create, history, showSnackbar]
  );

  const storeLocation = getQuery?.data?.storeLocations?.getStoreLocation;
  const emptyViewIsShown = !searchParams.has('new') && !loading && !storeLocation;
  const currentStoreLocation = useCallback(() => history.push('/store-locations?new'), [history]);
  const cancelEditing = useCallback(() => history.push('/store-locations'), [history]);

  return {
    loading,
    emptyViewIsShown,
    currentStoreLocation,
    cancelEditing,
    storeLocation,
    onSubmit
  };
};
