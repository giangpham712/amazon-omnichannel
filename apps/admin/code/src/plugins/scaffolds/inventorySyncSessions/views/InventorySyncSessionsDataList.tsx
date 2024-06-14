import React from 'react';
import { DeleteIcon } from '@webiny/ui/List/DataList/icons';
import { DataList, ScrollList, ListItem, ListItemText, ListItemMeta, ListActions } from '@webiny/ui/List';
import { useInventorySyncSessionsDataList } from './hooks/useInventorySyncSessionsDataList';

/**
 * Renders a list of all InventorySyncSession entries. Includes basic deletion, pagination, and sorting capabilities.
 * The data querying functionality is located in the `useInventorySyncSessionsDataList` React hook.
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

const InventorySyncSessionsDataList: React.FC = () => {
  const {
    inventorySyncSessions,
    loading,
    refresh,
    pagination,
    setSort,
    editInventorySyncSession,
    deleteInventorySyncSession,
    currentInventorySyncSessionId
  } = useInventorySyncSessionsDataList();

  return (
    <DataList
      title={'Inventory History'}
      data={inventorySyncSessions}
      loading={loading}
      refresh={refresh}
      pagination={pagination}
      sorters={sorters}
      setSorters={setSort}
    >
      {({ data }: { data: any[] }) => (
        <ScrollList>
          {data.map(item => (
            <ListItem key={item.id} selected={item.id === currentInventorySyncSessionId}>
              <ListItemText onClick={() => editInventorySyncSession(item.id)}>{item.title}</ListItemText>

              <ListItemMeta>
                <ListActions>
                  <DeleteIcon onClick={() => deleteInventorySyncSession(item)} />
                </ListActions>
              </ListItemMeta>
            </ListItem>
          ))}
        </ScrollList>
      )}
    </DataList>
  );
};

export default InventorySyncSessionsDataList;
