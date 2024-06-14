import React, { useMemo } from 'react';
import { ButtonIcon, ButtonSecondary } from '@webiny/ui/Button';

import { ReactComponent as AddIcon } from '@webiny/app-admin/assets/icons/add-18px.svg';
import {
  DataList,
  ScrollList,
  ListItem,
  ListItemText,
  ListItemGraphic,
  ListItemTextSecondary,
  ListItemMeta
} from '@webiny/ui/List';

import { Typography } from '@webiny/ui/Typography';

import { useOrderReturnsDataList } from './hooks/useOrderReturnsDataList';
import NewOrderReturnDialog from './NewOrderReturnDialog';
import moment from 'moment';

/**
 * Renders a list of all OrderReturn entries. Includes basic deletion, pagination, and sorting capabilities.
 * The data querying functionality is located in the `useOrderReturnsDataList` React hook.
 */

// By default, we are able to sort entries by time of creation (ascending and descending).
// More sorters can be added, but not that further adjustments will be needed on the GraphQL API side.
const sorters = [
  {
    label: 'Newest to oldest',
    value: 'createdOn_DESC'
  },
  {
    label: 'Oldest to newest',
    value: 'createdOn_ASC'
  }
];

const OrderReturnsDataList: React.FC = () => {
  const {
    orderReturns,
    inventoryItems,
    loading,
    refresh,
    pagination,
    setSort,
    newOrderReturn,
    showNewOrderReturnDialog,
    cancelNewOrderReturnDialog,
    processReturn,
    editOrderReturn,
    currentOrderReturnId
  } = useOrderReturnsDataList();

  const inventoryItemMap = useMemo(() => {
    return inventoryItems.reduce((result, item) => {
      result[item.sku] = item;
      return result;
    }, {});
  }, [inventoryItems]);

  return (
    <>
      <DataList
        title={'Returns'}
        data={orderReturns}
        loading={loading}
        refresh={refresh}
        pagination={pagination}
        sorters={sorters}
        setSorters={setSort}
        actions={
          <ButtonSecondary onClick={newOrderReturn}>
            <ButtonIcon icon={<AddIcon />} />
            New Return
          </ButtonSecondary>
        }
      >
        {({ data }: { data: any[] }) => {
          return (
            <>
              <ScrollList>
                {data.map(item => {
                  const inventoryItem = inventoryItemMap[item.merchantSku];
                  let itemName = item.merchantSku;
                  if (inventoryItem && inventoryItem.productName) {
                    itemName = `${itemName} - ${inventoryItem.productName}`;

                    if (
                      inventoryItem?.shopifyVariant?.title &&
                      inventoryItem?.shopifyVariant?.title !== 'Default Title'
                    ) {
                      itemName = `${itemName} - ${inventoryItem?.shopifyVariant?.title}`;
                    }
                  }

                  return (
                    <ListItem key={item.id} selected={item.id === currentOrderReturnId}>
                      <ListItemGraphic>
                        <img
                          style={{ maxHeight: '30px', maxWidth: '30px' }}
                          src={inventoryItem?.shopifyVariant?.product?.featureImage}
                        />
                      </ListItemGraphic>
                      <ListItemText onClick={() => editOrderReturn(item.id)}>
                        {itemName}
                        <ListItemTextSecondary>{item.returnMetadata?.returnReason}</ListItemTextSecondary>
                        <ListItemTextSecondary>
                          <strong>{item.status}</strong>
                        </ListItemTextSecondary>
                      </ListItemText>

                      <ListItemMeta>
                        <Typography style={{ color: '#000', alignSelf: 'end' }} use="body1">
                          {item.shipmentLocationName}
                        </Typography>
                        <Typography style={{ color: '#000' }} use="body2">
                          {moment(item.creationDateTime).format('lll')}
                        </Typography>
                      </ListItemMeta>
                    </ListItem>
                  );
                })}
              </ScrollList>
            </>
          );
        }}
      </DataList>
      <NewOrderReturnDialog
        open={showNewOrderReturnDialog}
        onClose={cancelNewOrderReturnDialog}
        onProcessReturn={processReturn}
      />
    </>
  );
};

export default OrderReturnsDataList;
