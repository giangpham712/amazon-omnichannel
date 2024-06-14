import { useCallback } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from '@webiny/react-router';
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar';
import { GET_ORDER_RETURN, GET_INVENTORY_ITEM, GET_STORE_LOCATION } from './graphql';
import { InventoryItemEntity } from '@purity/core/inventoryItems';

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

export const useOrderReturnsForm = () => {
  const { location, history } = useRouter();
  const { showSnackbar } = useSnackbar();
  const searchParams = new URLSearchParams(location.search);
  const currentOrderReturnId = searchParams.get('id');

  const getQuery = useQuery(GET_ORDER_RETURN, {
    variables: { id: currentOrderReturnId },
    skip: !currentOrderReturnId,
    onError: error => {
      history.push('/order-returns');
      showSnackbar(error.message);
    }
  });

  const loading = [getQuery].some(item => item.loading);

  const onSubmit = useCallback(async formData => {
    const data = getMutationData(formData);
    console.log(data);
  }, []);

  const orderReturn = getQuery?.data?.orderReturns?.getOrderReturn;
  const emptyViewIsShown = !searchParams.has('new') && !loading && !orderReturn;
  const currentOrderReturn = useCallback(() => history.push('/order-returns?new'), [history]);
  const cancelEditing = useCallback(() => history.push('/order-returns'), [history]);

  const getStoreLocationQuery = useQuery(GET_STORE_LOCATION, {
    variables: { spSupplySourceId: orderReturn?.fulfillmentLocationId },
    skip: !orderReturn?.fulfillmentLocationId,
    onError: error => {
      history.push('/orders');
      showSnackbar(error.message);
    }
  });

  const storeLocation = getStoreLocationQuery?.data?.storeLocations?.getStoreLocationBySPSupplySource;

  const getInventoryItemQuery = useQuery(GET_INVENTORY_ITEM, {
    variables: {
      locationId: storeLocation?.id,
      sku: orderReturn?.merchantSku
    },
    skip: !open || !orderReturn?.merchantSku || !storeLocation,
    onError: error => {
      showSnackbar(error.message);
    }
  });

  const inventoryItem = getInventoryItemQuery?.data?.inventoryItems
    ?.getInventoryItemByLocationAndSku as InventoryItemEntity;

  return {
    loading,
    emptyViewIsShown,
    currentOrderReturn,
    cancelEditing,
    orderReturn,
    inventoryItem,
    onSubmit
  };
};
