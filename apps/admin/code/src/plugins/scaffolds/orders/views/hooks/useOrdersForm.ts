import { useCallback, useState } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { useRouter } from '@webiny/react-router';
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar';
import {
  GET_ORDER,
  CONFIRM_ORDER,
  REJECT_ORDER,
  LIST_ORDERS,
  REFRESH_ORDER,
  ARCHIVE_ORDER,
  CREATE_PACKAGES,
  GENERATE_SHIPPING_LABEL,
  GET_STORE_LOCATION,
  SHIP_COMPLETE,
  GET_INVENTORY_ITEM
} from './graphql';
import { InventoryItemEntity } from '@purity/core/inventoryItems';

/**
 * Contains essential form functionality: data fetching, form submission, notifications, redirecting, and more.
 */

export const useOrdersForm = () => {
  const { location, history } = useRouter();
  const { showSnackbar } = useSnackbar();
  const searchParams = new URLSearchParams(location.search);
  const currentOrderId = searchParams.get('id');

  const [showCreatePackages, setShowCreatePackages] = useState<boolean>(false);

  const getQuery = useQuery(GET_ORDER, {
    variables: { id: currentOrderId },
    fetchPolicy: 'network-only',
    skip: !currentOrderId,
    onError: error => {
      history.push('/orders');
      showSnackbar(error.message);
    }
  });

  const order = getQuery?.data?.orders?.getOrder;

  const getStoreLocationQuery = useQuery(GET_STORE_LOCATION, {
    variables: { spSupplySourceId: order?.shipmentLocationId },
    skip: !order?.shipmentLocationId,
    onError: error => {
      history.push('/orders');
      showSnackbar(error.message);
    }
  });

  const storeLocation = getStoreLocationQuery?.data?.storeLocations?.getStoreLocationBySPSupplySource;

  const lineItem = order?.lineItems[0];
  const getInventoryItemQuery = useQuery(GET_INVENTORY_ITEM, {
    variables: {
      locationId: storeLocation?.id,
      sku: lineItem?.merchantSku
    },
    skip: !open || !lineItem?.merchantSku || !storeLocation,
    onError: error => {
      history.push('/orders');
      showSnackbar(error.message);
    }
  });

  const inventoryItem = getInventoryItemQuery?.data?.inventoryItems
    ?.getInventoryItemByLocationAndSku as InventoryItemEntity;

  const [confirm, confirmMutation] = useMutation(CONFIRM_ORDER, {
    refetchQueries: [{ query: LIST_ORDERS }]
  });

  const [reject, rejectMutation] = useMutation(REJECT_ORDER, {
    refetchQueries: [{ query: LIST_ORDERS }]
  });

  const [refresh, refreshMutation] = useMutation(REFRESH_ORDER, {
    refetchQueries: [{ query: LIST_ORDERS }]
  });

  const [archive, archiveMutation] = useMutation(ARCHIVE_ORDER, {
    refetchQueries: [{ query: LIST_ORDERS }]
  });

  const [createPackages, createPackagesMutation] = useMutation(CREATE_PACKAGES, {
    refetchQueries: [{ query: LIST_ORDERS }]
  });

  const [generateShippingLabel, generateShippingLabelMutation] = useMutation(GENERATE_SHIPPING_LABEL, {
    refetchQueries: [{ query: LIST_ORDERS }]
  });

  const [shipComplete, shipCompleteMutation] = useMutation(SHIP_COMPLETE, {
    refetchQueries: [{ query: LIST_ORDERS }]
  });

  const loading = [
    getQuery,
    confirmMutation,
    rejectMutation,
    archiveMutation,
    refreshMutation,
    createPackagesMutation,
    generateShippingLabelMutation,
    shipCompleteMutation
  ].some(item => item.loading);

  const onConfirmOrder = useCallback(async () => {
    try {
      await confirm({
        variables: { id: currentOrderId }
      });
      showSnackbar('Order confirmed.');
    } catch (e) {
      showSnackbar(e.message);
    }
  }, [confirm, currentOrderId, showSnackbar]);

  const onRejectOrder = useCallback(async () => {
    try {
      await reject({
        variables: { id: currentOrderId, data: { reason: null } }
      });
      showSnackbar('Order rejected.');
    } catch (e) {
      showSnackbar(e.message);
    }
  }, [reject, currentOrderId, showSnackbar]);

  const onRefreshOrder = useCallback(async () => {
    try {
      await refresh({
        variables: { id: currentOrderId }
      });
      showSnackbar('Order refreshed.');
    } catch (e) {
      showSnackbar(e.message);
    }
  }, [refresh, currentOrderId, showSnackbar]);

  const onArchiveOrder = useCallback(async () => {
    try {
      await archive({
        variables: { id: currentOrderId }
      });
      showSnackbar('Order archived.');
    } catch (e) {
      showSnackbar(e.message);
    }
  }, [currentOrderId, showSnackbar]);

  const onCreatePackages = useCallback(
    async ({ width, widthUnit, length, lengthUnit, height, heightUnit, weight, weightUnit }) => {
      try {
        await createPackages({
          variables: {
            id: currentOrderId,
            data: {
              packages: [
                {
                  width,
                  widthUnit,
                  length,
                  lengthUnit,
                  height,
                  heightUnit,
                  weight,
                  weightUnit
                }
              ]
            }
          }
        });
        showSnackbar('');
      } catch (e) {
        showSnackbar(e.message);
      }
    },
    [createPackages, currentOrderId, showSnackbar]
  );

  const onGenerateShippingLabel = useCallback(async () => {
    try {
      await generateShippingLabel({
        variables: { id: currentOrderId }
      });
      showSnackbar('');
    } catch (e) {
      showSnackbar(e.message);
    }
  }, [generateShippingLabel, currentOrderId, showSnackbar]);

  const onGenerateInvoice = useCallback(async () => {
    try {
      await generateShippingLabel({
        variables: { id: currentOrderId }
      });
      showSnackbar('');
    } catch (e) {
      showSnackbar(e.message);
    }
  }, [generateShippingLabel, currentOrderId, showSnackbar]);

  const onRetrieveShippingOptions = useCallback(async () => {
    try {
      //
      showSnackbar('');
    } catch (e) {
      showSnackbar(e.message);
    }
  }, [showSnackbar]);

  const onShipComplete = useCallback(async () => {
    try {
      await shipComplete({
        variables: { id: currentOrderId }
      });
      showSnackbar('');
    } catch (e) {
      showSnackbar(e.message);
    }
  }, [shipComplete, currentOrderId, showSnackbar]);

  const emptyViewIsShown = !searchParams.has('new') && !loading && !order;
  const currentOrder = useCallback(() => history.push('/orders?new'), [history]);
  const onCancel = useCallback(() => history.push('/orders'), [history]);

  return {
    showCreatePackages,
    setShowCreatePackages,
    loading,
    emptyViewIsShown,
    currentOrder,
    storeLocation,
    inventoryItems: inventoryItem ? [inventoryItem] : [],
    onCancel,
    onRefreshOrder,
    onArchiveOrder,
    onConfirmOrder,
    onRejectOrder,
    onCreatePackages,
    onGenerateShippingLabel,
    onGenerateInvoice,
    onRetrieveShippingOptions,
    onShipComplete,
    order
  };
};
