import { SimpleForm, SimpleFormContent } from '@webiny/app-admin/components/SimpleForm';
import { Form } from '@webiny/form';
import { Input } from '@webiny/ui/Input';
import { ButtonSecondary } from '@webiny/ui/Button';
import { Grid, Cell } from '@webiny/ui/Grid';
import { AccordionItem } from '@webiny/ui/Accordion';
import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { GET_INVENTORY_ITEM, GET_STORE_LOCATION } from './hooks/graphql';
import { InventoryItemEntity } from '@purity/core/inventoryItems';
import { useRouter } from '@webiny/react-router';
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar';

const ProcessOrderReturnForm = ({ item, processOrderReturn }) => {
  const { history } = useRouter();
  const { showSnackbar } = useSnackbar();

  const getStoreLocationQuery = useQuery(GET_STORE_LOCATION, {
    variables: { spSupplySourceId: item?.fulfillmentLocationId },
    skip: !item?.fulfillmentLocationId,
    onError: error => {
      history.push('/orders');
      showSnackbar(error.message);
    }
  });

  const storeLocation = getStoreLocationQuery?.data?.storeLocations?.getStoreLocationBySPSupplySource;

  const getInventoryItemQuery = useQuery(GET_INVENTORY_ITEM, {
    variables: {
      locationId: storeLocation?.id,
      sku: item?.merchantSku
    },
    skip: !open || !item?.merchantSku || !storeLocation,
    onError: error => {
      history.push('/orders');
      showSnackbar(error.message);
    }
  });

  const inventoryItem = getInventoryItemQuery?.data?.inventoryItems
    ?.getInventoryItemByLocationAndSku as InventoryItemEntity;

  let itemName = item?.merchantSku;
  if (inventoryItem && inventoryItem.productName) {
    itemName = `${itemName} - ${inventoryItem.productName}`;

    if (inventoryItem?.shopifyVariant?.title && inventoryItem?.shopifyVariant?.title !== 'Default Title') {
      itemName = `${itemName} - ${inventoryItem?.shopifyVariant?.title}`;
    }
  }

  return (
    <AccordionItem
      key={item.returnId}
      icon={
        <img
          style={{ maxHeight: '36px', maxWidth: '36px' }}
          src={inventoryItem?.shopifyVariant?.product?.featureImage}
        />
      }
      title={<div>{itemName}</div>}
      description={`Qty: ${item.numberOfUnits}`}
    >
      <div>Reason: {item.returnMetadata.returnReason}</div>
      <Form
        data={{
          return: {
            returnId: item.returnId,
            numberOfUnits: item.numberOfUnits
          },
          itemConditions: {
            sellable: 0,
            defective: 0,
            customerDamaged: 0,
            carrierDamaged: 0,
            fraud: 0,
            wrongItem: 0
          }
        }}
        onSubmit={processOrderReturn}
      >
        {({ submit: submitReturn, Bind: BindReturn }) => (
          <SimpleForm noElevation={true}>
            <SimpleFormContent>
              <Grid style={{ paddingLeft: 0, paddingRight: 0 }}>
                <Cell span={4}>
                  <BindReturn name="itemConditions.sellable">
                    <Input label={'Sellable'} />
                  </BindReturn>
                </Cell>
                <Cell span={4}>
                  <BindReturn name="itemConditions.defective">
                    <Input label={'Defective'} />
                  </BindReturn>
                </Cell>
                <Cell span={4}>
                  <BindReturn name="itemConditions.customerDamaged">
                    <Input label={'Customer Damaged'} />
                  </BindReturn>
                </Cell>
                <Cell span={4}>
                  <BindReturn name="itemConditions.carrierDamaged">
                    <Input label={'Carrier Damaged'} />
                  </BindReturn>
                </Cell>
                <Cell span={4}>
                  <BindReturn name="itemConditions.fraud">
                    <Input label={'Fraud'} disabled />
                  </BindReturn>
                </Cell>
                <Cell span={4}>
                  <BindReturn name="itemConditions.wrongItem">
                    <Input label={'Wrong Item'} disabled />
                  </BindReturn>
                </Cell>
                <Cell span={4} style={{ visibility: 'hidden' }}>
                  <BindReturn name="return.returnId">
                    <Input />
                  </BindReturn>
                </Cell>
                <Cell span={4} style={{ visibility: 'hidden' }}>
                  <BindReturn name="return.numberOfUnits">
                    <Input label={'Sellable'} />
                  </BindReturn>
                </Cell>
              </Grid>
            </SimpleFormContent>
            <div style={{ textAlign: 'right' }}>
              {item.status === 'CREATED' && (
                <ButtonSecondary
                  onClick={ev => {
                    submitReturn(ev);
                  }}
                >
                  Process
                </ButtonSecondary>
              )}
            </div>
          </SimpleForm>
        )}
      </Form>
    </AccordionItem>
  );
};

export default ProcessOrderReturnForm;
