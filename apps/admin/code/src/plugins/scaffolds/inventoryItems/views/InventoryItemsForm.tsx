import React from 'react';
import { Form } from '@webiny/form';
import { Grid, Cell } from '@webiny/ui/Grid';
import { Accordion, AccordionItem } from '@webiny/ui/Accordion';

import { Input } from '@webiny/ui/Input';
import { ButtonDefault, ButtonIcon, ButtonPrimary } from '@webiny/ui/Button';
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
import { useInventoryItemsForm } from './hooks/useInventoryItemsForm';

/**
 * Renders a form which enables creating new or editing existing Inventory Item entries.
 * Includes two basic fields - title (required) and description.
 * The form submission-related functionality is located in the `useInventoryItemsForm` React hook.
 */
const InventoryItemsForm: React.FC = () => {
  const { loading, emptyViewIsShown, currentInventoryItem, cancelEditing, inventoryItem, onSubmit } =
    useInventoryItemsForm();

  // Render "No content" selected view.
  if (emptyViewIsShown) {
    return (
      <EmptyView
        title={'Click on the left side list to display Inventory Items details or create a...'}
        action={
          <ButtonDefault onClick={currentInventoryItem}>
            <ButtonIcon icon={<AddIcon />} /> {'New Inventory Item'}
          </ButtonDefault>
        }
      />
    );
  }

  return (
    <Form data={inventoryItem} onSubmit={onSubmit}>
      {({ data, submit, Bind }) => (
        <SimpleForm>
          {loading && <CircularProgress />}
          <SimpleFormHeader title={`${data.sku} - ${data.storeLocation?.name}` || 'New Inventory Item'} />
          <SimpleFormContent>
            <div></div>
            <Accordion>
              <AccordionItem open={true} description="" icon={null} title="General">
                <Grid>
                  <Cell span={12}>
                    <Bind name="asin" validators={validation.create('maxLength:50')}>
                      <Input label={'ASIN'} />
                    </Bind>
                  </Cell>
                  <Cell span={12}>
                    <Bind name="sku" validators={validation.create('maxLength:50')}>
                      <Input label={'SKU'} />
                    </Bind>
                  </Cell>
                  <Cell span={12}>
                    <Bind name="productName" validators={validation.create('maxLength:250')}>
                      <Input label={'Product Name'} />
                    </Bind>
                  </Cell>
                </Grid>
              </AccordionItem>
              <AccordionItem description="" icon={null} title="Product Info">
                <Grid>
                  <Cell span={12}>
                    <Bind name="productInfo.netWeight" validators={validation.create('maxLength:50')}>
                      <Input label={'Net Weight'} />
                    </Bind>
                  </Cell>

                  <Cell span={12}>
                    <Bind name="productInfo.shippingWeightG" validators={validation.create('maxLength:50')}>
                      <Input label={'Shipping Weight (GRAM)'} />
                    </Bind>
                  </Cell>

                  <Cell span={12}>
                    <Bind name="productInfo.lengthCm" validators={validation.create('maxLength:50')}>
                      <Input label={'Length (CM)'} />
                    </Bind>
                  </Cell>

                  <Cell span={12}>
                    <Bind name="productInfo.heightCm" validators={validation.create('maxLength:50')}>
                      <Input label={'Height (CM)'} />
                    </Bind>
                  </Cell>

                  <Cell span={12}>
                    <Bind name="productInfo.widthCm" validators={validation.create('maxLength:50')}>
                      <Input label={'Width (CM)'} />
                    </Bind>
                  </Cell>
                </Grid>
              </AccordionItem>
              <AccordionItem description="" icon={null} title="Inventory">
                <Grid>
                  <Cell span={12}>
                    <Bind name="sellableQuantity" validators={validation.create('integer')}>
                      <Input label={'Sellable Quantity'} />
                    </Bind>
                  </Cell>
                  <Cell span={12}>
                    <Bind name="bufferedQuantity" validators={validation.create('integer')}>
                      <Input label={'Buffered Quantity'} />
                    </Bind>
                  </Cell>
                  <Cell span={12}>
                    <Bind name="reservedQuantity" validators={validation.create('integer')}>
                      <Input label={'Reserved Quantity'} />
                    </Bind>
                  </Cell>
                </Grid>
              </AccordionItem>
              <AccordionItem description="" icon={null} title="Shopify">
                <Grid>
                  <Cell span={12}>
                    <Bind name="shopifyVariant.id" validators={validation.create('maxLength:50')}>
                      <Input label={'Variant ID'} />
                    </Bind>
                  </Cell>

                  <Cell span={12}>
                    <Bind name="shopifyVariant.title" validators={validation.create('maxLength:50')}>
                      <Input label={'Variant Title'} />
                    </Bind>
                  </Cell>

                  <Cell span={12}>
                    <Bind name="shopifyVariant.product.id" validators={validation.create('maxLength:50')}>
                      <Input label={'Product ID'} />
                    </Bind>
                  </Cell>

                  <Cell span={12}>
                    <Bind name="shopifyVariant.product.title" validators={validation.create('maxLength:50')}>
                      <Input label={'Product Title'} />
                    </Bind>
                  </Cell>
                </Grid>
              </AccordionItem>
            </Accordion>
          </SimpleFormContent>
          <SimpleFormFooter>
            <ButtonDefault onClick={cancelEditing}>Cancel</ButtonDefault>
            <ButtonPrimary
              onClick={ev => {
                submit(ev);
              }}
            >
              Save Inventory Item
            </ButtonPrimary>
          </SimpleFormFooter>
        </SimpleForm>
      )}
    </Form>
  );
};

export default InventoryItemsForm;
