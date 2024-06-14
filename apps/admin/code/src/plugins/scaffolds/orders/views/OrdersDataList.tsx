import React, { useCallback, useMemo } from 'react';
import { debounce, keyBy } from 'lodash';
import moment from 'moment';
import styled from '@emotion/styled';
import SearchUI from '@webiny/app-admin/components/SearchUI';
import {
  DataList,
  DataListModalOverlay,
  DataListModalOverlayAction,
  ListItem,
  ListItemText,
  ListItemTextSecondary,
  ListItemMeta
} from '@webiny/ui/List';
import { Form } from '@webiny/form';
import { Cell, Grid } from '@webiny/ui/Grid';
import { Select } from '@webiny/ui/Select';
import { Switch } from '@webiny/ui/Switch';
import { AutoComplete } from '@webiny/ui/AutoComplete';
import { Typography } from '@webiny/ui/Typography';
import { ReactComponent as SettingsIcon } from '@webiny/app-admin/assets/icons/round-settings-24px.svg';
import { positionValues as PositionValues } from 'react-custom-scrollbars';
import { Scrollbar } from '@webiny/ui/Scrollbar';
import { OrdersDataListWhereState, useOrdersDataList } from './hooks/useOrdersDataList';

/**
 * Renders a list of all Order entries. Includes basic deletion, pagination, and sorting capabilities.
 * The data querying functionality is located in the `useOrdersDataList` React hook.
 */

const statuses = [
  {
    label: '',
    value: ''
  },
  {
    label: 'ACCEPTED',
    value: 'ACCEPTED',
    color: '#084298'
  },
  {
    label: 'CANCELLED',
    value: 'CANCELLED',
    color: '#842029'
  },
  {
    label: 'CONFIRMED',
    value: 'CONFIRMED',
    color: '#084298'
  },
  {
    label: 'DELIVERED',
    value: 'DELIVERED',
    color: '#0f5132'
  },
  {
    label: 'INVOICE_GENERATED',
    value: 'INVOICE_GENERATED'
  },
  {
    label: 'PACKAGE_CREATED',
    value: 'PACKAGE_CREATED'
  },
  {
    label: 'PICKUP_SLOT_RETRIEVED',
    value: 'PICKUP_SLOT_RETRIEVED'
  },
  {
    label: 'SHIPLABEL_GENERATED',
    value: 'SHIPLABEL_GENERATED'
  },
  {
    label: 'SHIPPED',
    value: 'SHIPPED',
    color: '#0f5132'
  }
];

const statusMap = statuses.reduce((result, item) => {
  result[item.value] = item;
  return result;
}, {});

const InlineLoaderWrapper = styled('div')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: 40,
  backgroundColor: 'var(--mdc-theme-surface)'
});

const OrdersDataList: React.FC = () => {
  const {
    orders,
    loading,
    storeLocations,
    refresh,
    pagination,
    setSort,
    searchKey,
    setSearchKey,
    where,
    setWhere,
    editOrder,
    currentOrderId,
    loadMore,
    loadMoreLoading
  } = useOrdersDataList();

  const loadMoreOnScroll = useCallback(
    debounce((scrollFrame: PositionValues) => {
      if (scrollFrame.top > 0.9) {
        loadMore();
      }
    }, 500),
    [orders]
  );

  const ordersData = useMemo(() => {
    const storeLocationMap = keyBy(storeLocations || [], s => s.spSupplySourceId);
    return orders.map(o => ({
      ...o,
      shipmentLocationName: storeLocationMap[o.shipmentLocationId]?.name
    }));
  }, [orders, storeLocations]);

  const ordersFiltersForm = useMemo(
    () => (
      <Form
        data={{ ...where }}
        onChange={({ status, shipmentLocationId, archived }) => {
          // Update "where" filter.
          const where: OrdersDataListWhereState = { shipmentLocationId, status: undefined, archived };

          if (status !== '') {
            where.status = status;
          } else {
            where.status = undefined;
          }

          if (!archived) {
            where.archived = undefined;
          }

          setWhere(where);
        }}
      >
        {({ Bind }) => (
          <Grid>
            <Cell span={12}>
              <Bind name={'shipmentLocationId'}>
                <AutoComplete
                  description={'Filter by a specific location.'}
                  label={`Filter by location`}
                  options={storeLocations.map(item => ({
                    id: item.spSupplySourceId,
                    name: item.name
                  }))}
                />
              </Bind>
            </Cell>
            <Cell span={12}>
              <Bind name={'status'}>
                <Select label={`Filter by status`} description={'Filter by a specific order status.'}>
                  {statuses.map(s => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </Bind>
            </Cell>
            <Cell span={12}>
              <Bind name={'archived'}>
                <Switch label={'Archived'} description={''} />
              </Bind>
            </Cell>
          </Grid>
        )}
      </Form>
    ),
    [storeLocations, where, setWhere]
  );

  const ordersDataListModalOverlay = (
    <DataListModalOverlay>
      <div></div>
    </DataListModalOverlay>
  );

  return (
    <DataList
      title="Orders"
      data={ordersData}
      search={<SearchUI value={searchKey} onChange={setSearchKey} inputPlaceholder={'Search orders'} />}
      modalOverlay={ordersDataListModalOverlay}
      modalOverlayAction={
        <DataListModalOverlayAction icon={<SettingsIcon />} data-testid={'default-data-list.filter'} />
      }
      filters={ordersFiltersForm}
      loading={loading}
      refresh={refresh}
      pagination={pagination}
      setSorters={setSort}
    >
      {({ data }: { data: any[] }) => (
        <>
          <Scrollbar data-testid="default-data-list" onScrollFrame={scrollFrame => loadMoreOnScroll(scrollFrame)}>
            {data.map(item => (
              <ListItem key={item.id} selected={item.id === currentOrderId}>
                <ListItemText onClick={() => editOrder(item.id)}>
                  {item.metadata.buyerOrderId}

                  <ListItemTextSecondary>
                    <strong style={{ color: statusMap[item.status].color || undefined }}>
                      <span>
                        {item.status === 'SHIPPED' && item.shippingInfo.recommendedShipMethod === 'AMZL_US_SP_PICKUP'
                          ? 'CUSTOMER PICKED UP'
                          : item.status}
                      </span>
                    </strong>
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
            ))}
          </Scrollbar>
          {loadMoreLoading && (
            <InlineLoaderWrapper>
              <Typography use={'overline'}>{`Loading more orders...`}</Typography>
            </InlineLoaderWrapper>
          )}
        </>
      )}
    </DataList>
  );
};

export default OrdersDataList;
