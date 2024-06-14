import React from 'react';
import { Form } from '@webiny/form';
import { Grid, Cell } from '@webiny/ui/Grid';
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
import { useStoreLocationsForm } from './hooks/useStoreLocationsForm';

/**
 * Renders a form which enables creating new or editing existing Store Location entries.
 * Includes two basic fields - title (required) and description.
 * The form submission-related functionality is located in the `useStoreLocationsForm` React hook.
 */
const StoreLocationsForm: React.FC = () => {
  const { loading, emptyViewIsShown, currentStoreLocation, cancelEditing, storeLocation, onSubmit } =
    useStoreLocationsForm();

  // Render "No content" selected view.
  if (emptyViewIsShown) {
    return (
      <EmptyView
        title={'Click on the left side list to display Store Locations details or create a...'}
        action={
          <ButtonDefault onClick={currentStoreLocation}>
            <ButtonIcon icon={<AddIcon />} /> {'New Store Location'}
          </ButtonDefault>
        }
      />
    );
  }

  return (
    <Form data={storeLocation} onSubmit={onSubmit}>
      {({ data, submit, Bind }) => (
        <SimpleForm>
          {loading && <CircularProgress />}
          <SimpleFormHeader title={data.title || 'New Store Location'} />
          <SimpleFormContent>
            <Grid>
              <Cell span={12}>
                <Bind name="name" validators={validation.create('required')}>
                  <Input label={'Name'} />
                </Bind>
              </Cell>
              <Cell span={12}>
                <Bind name="storeAdminEmail" validators={validation.create('required')}>
                  <Input label={'Admin Email'} />
                </Bind>
              </Cell>
              <Cell span={12}>
                <Bind name="spSupplySourceId" validators={validation.create('required')}>
                  <Input label={'SP Supply Source Id'} />
                </Bind>
              </Cell>
              <Cell span={12}>
                <Bind name="spSupplySourceCode" validators={validation.create('required')}>
                  <Input label={'SP Supply Source Code'} />
                </Bind>
              </Cell>
              <Cell span={12}>
                <Bind name="shopifyDomain">
                  <Input label={'Shopify Domain'} />
                </Bind>`
              </Cell>
              <Cell span={12}>
                <Bind name="shopifyLocationId">
                  <Input label={'Shopify Location Id'} />
                </Bind>
              </Cell>
            </Grid>
          </SimpleFormContent>
          <SimpleFormFooter>
            <ButtonDefault onClick={cancelEditing}>Cancel</ButtonDefault>
            <ButtonPrimary
              onClick={ev => {
                submit(ev);
              }}
            >
              Save Store Location
            </ButtonPrimary>
          </SimpleFormFooter>
        </SimpleForm>
      )}
    </Form>
  );
};

export default StoreLocationsForm;
