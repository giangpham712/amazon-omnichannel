import React from 'react';
import { DeleteIcon } from '@webiny/ui/List/DataList/icons';
import { ButtonIcon, ButtonSecondary } from '@webiny/ui/Button';
import { ReactComponent as AddIcon } from '@webiny/app-admin/assets/icons/add-18px.svg';
import { DataList, ScrollList, ListItem, ListItemText, ListItemMeta, ListActions } from '@webiny/ui/List';
import { useStoreLocationsDataList } from './hooks/useStoreLocationsDataList';

/**
 * Renders a list of all StoreLocation entries. Includes basic deletion, pagination, and sorting capabilities.
 * The data querying functionality is located in the `useStoreLocationsDataList` React hook.
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

const StoreLocationsDataList: React.FC = () => {
  const {
    storeLocations,
    loading,
    refresh,
    pagination,
    setSort,
    newStoreLocation,
    editStoreLocation,
    deleteStoreLocation,
    currentStoreLocationId
  } = useStoreLocationsDataList();

  return (
    <DataList
      title={'Store Locations'}
      data={storeLocations}
      loading={loading}
      refresh={refresh}
      pagination={pagination}
      sorters={sorters}
      setSorters={setSort}
      actions={
        <ButtonSecondary onClick={newStoreLocation}>
          <ButtonIcon icon={<AddIcon />} />
          New Store Location
        </ButtonSecondary>
      }
    >
      {({ data }: { data: any[] }) => (
        <ScrollList>
          {data.map(item => (
            <ListItem key={item.id} selected={item.id === currentStoreLocationId}>
              <ListItemText onClick={() => editStoreLocation(item.id)}>{item.name}</ListItemText>

              <ListItemMeta>
                <ListActions>
                  <DeleteIcon onClick={() => deleteStoreLocation(item)} />
                </ListActions>
              </ListItemMeta>
            </ListItem>
          ))}
        </ScrollList>
      )}
    </DataList>
  );
};

export default StoreLocationsDataList;
