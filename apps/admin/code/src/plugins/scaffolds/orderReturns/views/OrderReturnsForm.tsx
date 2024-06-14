import React from 'react';
import { Form } from '@webiny/form';
import { Grid, Cell } from '@webiny/ui/Grid';
import { Typography } from '@webiny/ui/Typography';
import { Input } from '@webiny/ui/Input';
import { ButtonDefault, ButtonIcon } from '@webiny/ui/Button';
import { CircularProgress } from '@webiny/ui/Progress';
import EmptyView from '@webiny/app-admin/components/EmptyView';
import { validation } from '@webiny/validation';
import { ReactComponent as AddIcon } from '@webiny/app-admin/assets/icons/add-18px.svg';
import {
  SimpleForm,
  SimpleFormFooter,
  SimpleFormContent,
  SimpleFormHeader
} from '@webiny/app-admin/components/SimpleForm';
import { useOrderReturnsForm } from './hooks/useOrderReturnsForm';

/**
 * Renders a form which enables creating new or editing existing Order Return entries.
 * Includes two basic fields - title (required) and description.
 * The form submission-related functionality is located in the `useOrderReturnsForm` React hook.
 */
const OrderReturnsForm: React.FC = () => {
  const { loading, emptyViewIsShown, currentOrderReturn, cancelEditing, orderReturn, inventoryItem, onSubmit } =
    useOrderReturnsForm();

  // Render "No content" selected view.
  if (emptyViewIsShown) {
    return (
      <EmptyView
        title={'Click on the left side list to display Order Returns details or create a...'}
        action={
          <ButtonDefault onClick={currentOrderReturn}>
            <ButtonIcon icon={<AddIcon />} /> {'New Return'}
          </ButtonDefault>
        }
      />
    );
  }

  let itemName = orderReturn?.merchantSku;
  if (inventoryItem && inventoryItem.productName) {
    itemName = `${itemName} - ${inventoryItem.productName}`;

    if (inventoryItem?.shopifyVariant?.title && inventoryItem?.shopifyVariant?.title !== 'Default Title') {
      itemName = `${itemName} - ${inventoryItem?.shopifyVariant?.title}`;
    }
  }

  return (
    <Form data={orderReturn} onSubmit={onSubmit}>
      {({ data, Bind }) => {
        return (
          <SimpleForm>
            {loading && <CircularProgress />}
            <SimpleFormHeader
              title={
                <div>
                  <Typography use="headline5">{data.id ? `${data.merchantSku}` : 'New Order Return'}</Typography> <br />
                  <Typography use="subtitle1">{data.returnMetadata?.returnReason}</Typography> <br />
                </div>
              }
            />
            <SimpleFormContent>
              <Grid>
                <Cell span={12}>
                  <Input label={'Item'} value={`${itemName}`} />
                </Cell>
                <Cell span={12}>
                  <Input label={'Status'} value={`${data.status}`} />
                </Cell>
                <Cell span={12}>
                  <Bind name="numberOfUnits" validators={validation.create('required')}>
                    <Input label={'Quantity'} />
                  </Bind>
                </Cell>
                <Cell span={12}>
                  <Bind name="returnMetadata.returnReason" validators={validation.create('maxLength:500')}>
                    <Input label={'Return Reason'} description={''} rows={2} />
                  </Bind>
                </Cell>
                <Cell span={12}>
                  <Bind name="returnMetadata.rmaId" validators={validation.create('required')}>
                    <Input label={'Amazon Return ID'} />
                  </Bind>
                </Cell>
                <Cell span={12}>
                  <Bind name="creationDateTime" validators={validation.create('required')}>
                    <Input label={'Creation Time'} />
                  </Bind>
                </Cell>
                <Cell span={12}>
                  <Bind name="lastUpdatedDateTime" validators={validation.create('required')}>
                    <Input label={'Last Update Time'} />
                  </Bind>
                </Cell>
              </Grid>
            </SimpleFormContent>
            <SimpleFormFooter>
              <ButtonDefault onClick={cancelEditing}>Close</ButtonDefault>
            </SimpleFormFooter>
          </SimpleForm>
        );
      }}
    </Form>
  );
};

export default OrderReturnsForm;
