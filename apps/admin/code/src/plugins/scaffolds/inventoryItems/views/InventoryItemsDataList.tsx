import React, { useCallback, useMemo } from 'react';
import { AutoComplete } from '@webiny/ui/AutoComplete';
import { Select } from '@webiny/ui/Select';
import { Cell, Grid } from '@webiny/ui/Grid';
import {
  DataList,
  DataListModalOverlay,
  DataListModalOverlayAction,
  ListItem,
  ListItemGraphic,
  ListItemText,
  ListItemTextSecondary,
  ListItemMeta
} from '@webiny/ui/List';
import { InventoryItemsDataListWhereState, useInventoryItemsDataList } from './hooks/useInventoryItemsDataList';
import SearchUI from '@webiny/app-admin/components/SearchUI';
import { debounce } from 'lodash';
import { Form } from '@webiny/form';
import { Scrollbar } from '@webiny/ui/Scrollbar';
import { Typography } from '@webiny/ui/Typography';
import { ReactComponent as FilterIcon } from '@webiny/app-admin/assets/icons/filter-24px.svg';
import { positionValues as PositionValues } from 'react-custom-scrollbars';
import styled from '@emotion/styled';

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

const InventoryItemsDataList: React.FC = () => {
  const {
    inventoryItems,
    loading,
    storeLocations,
    refresh,
    setSort,
    searchKey,
    setSearchKey,
    where,
    setWhere,
    editInventoryItem,
    currentInventoryItemId,
    loadMore,
    loadMoreLoading
  } = useInventoryItemsDataList();

  const loadMoreOnScroll = useCallback(
    debounce((scrollFrame: PositionValues) => {
      if (scrollFrame.top > 0.9) {
        loadMore();
      }
    }, 500),
    [inventoryItems]
  );

  const inventoryItemsData = useMemo(() => {
    return inventoryItems.map(o => ({
      ...o
    }));
  }, [inventoryItems]);

  const inventoryItemsDataListModalOverlay = useMemo(
    () => (
      <DataListModalOverlay>
        <Form
          data={{ ...where }}
          onChange={({ storeLocationId }) => {
            // Update "where" filter.
            const where: InventoryItemsDataListWhereState = { storeLocationId };

            setWhere(where);
          }}
        >
          {({ Bind }) => (
            <Grid>
              <Cell span={12}>
                <Bind name={'storeLocationId'}>
                  <AutoComplete
                    description={'Filter by a specific location.'}
                    label={`Filter by location`}
                    options={storeLocations.map(item => ({
                      id: item.id,
                      name: item.name
                    }))}
                  />
                </Bind>
              </Cell>
              <Cell span={12}>
                <Bind name={'stockStatus'} defaultValue={''}>
                  <Select label="Stock status">
                    <option value=""></option>
                    <option value="IN_STOCK">In stock</option>
                    <option value="OUT_OF_STOCK">Out of stock</option>
                  </Select>
                </Bind>
              </Cell>
            </Grid>
          )}
        </Form>
      </DataListModalOverlay>
    ),
    [storeLocations, setWhere, where]
  );

  return (
    <DataList
      title={'Inventory Items'}
      data={inventoryItemsData}
      search={<SearchUI value={searchKey} onChange={setSearchKey} inputPlaceholder={'Search items'} />}
      modalOverlay={inventoryItemsDataListModalOverlay}
      modalOverlayAction={<DataListModalOverlayAction icon={<FilterIcon />} data-testid={'default-data-list.filter'} />}
      loading={loading}
      refresh={refresh}
      setSorters={setSort}
    >
      {({ data }: { data: any[] }) => (
        <>
          <Scrollbar data-testid="default-data-list" onScrollFrame={scrollFrame => loadMoreOnScroll(scrollFrame)}>
            {data.map(item => (
              <ListItem
                key={item.id}
                selected={item.id === currentInventoryItemId}
                onClick={() => editInventoryItem(item.id)}
              >
                <ListItemGraphic>
                  <img
                    style={{ maxHeight: '30px', maxWidth: '30px' }}
                    src={item?.shopifyVariant?.product?.featureImage}
                  />
                </ListItemGraphic>
                <ListItemText>
                  <span
                    style={{
                      display: 'inline-block',
                      maxWidth: 'calc(100% - 125px)',
                      whiteSpace: 'break-spaces',
                      lineHeight: '1.5em'
                    }}
                  >
                    {item.sku} - {item.productName}{' '}
                    {item.shopifyVariant?.title && item.shopifyVariant?.title !== 'Default Title'
                      ? ' - ' + item.shopifyVariant?.title
                      : ''}
                  </span>
                  <ListItemTextSecondary>{item.storeLocation?.name}</ListItemTextSecondary>
                </ListItemText>

                <ListItemMeta>
                  <ListItemTextSecondary>Sellable: {item.sellableQuantity}</ListItemTextSecondary>
                  <ListItemTextSecondary>Reserved: {item.reservedQuantity}</ListItemTextSecondary>
                </ListItemMeta>
              </ListItem>
            ))}
          </Scrollbar>
          {loadMoreLoading && (
            <InlineLoaderWrapper>
              <Typography use={'overline'}>{`Loading more inventory items...`}</Typography>
            </InlineLoaderWrapper>
          )}
        </>
      )}
    </DataList>
  );
};

export default InventoryItemsDataList;
