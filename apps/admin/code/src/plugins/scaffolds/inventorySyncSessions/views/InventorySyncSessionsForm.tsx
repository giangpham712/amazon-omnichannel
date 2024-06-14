import React from 'react';
import { Form } from '@webiny/form';
import { Grid, Cell } from '@webiny/ui/Grid';
import { Input } from '@webiny/ui/Input';
import { ButtonDefault, ButtonIcon } from '@webiny/ui/Button';
import { Accordion, AccordionItem } from "@webiny/ui/Accordion";
import {
  List,
  ListItem,
  ListItemText,
  ListItemTextPrimary,
  ListItemTextSecondary
} from "@webiny/ui/List";
import { CircularProgress } from '@webiny/ui/Progress';
import EmptyView from '@webiny/app-admin/components/EmptyView';
import { validation } from '@webiny/validation';
import { ReactComponent as AddIcon } from '@webiny/app-admin/assets/icons/add-18px.svg';
import {
  SimpleForm,
  SimpleFormContent,
  SimpleFormHeader
} from '@webiny/app-admin/components/SimpleForm';
import { useInventorySyncSessionsForm } from './hooks/useInventorySyncSessionsForm';

/**
 * Renders a form which enables creating new or editing existing Inventory Sync Session entries.
 * Includes two basic fields - title (required) and description.
 * The form submission-related functionality is located in the `useInventorySyncSessionsForm` React hook.
 */
const InventorySyncSessionsForm: React.FC = () => {
  const {
    loading,
    emptyViewIsShown,
    currentInventorySyncSession,
    inventorySyncSession,
    onSubmit
  } = useInventorySyncSessionsForm();

  // Render "No content" selected view.
  if (emptyViewIsShown) {
    return (
        <EmptyView
            title={'Click on the left side list to display Inventory Sync Sessions details or create a...'}
            action={
              <ButtonDefault onClick={currentInventorySyncSession}>
                <ButtonIcon icon={<AddIcon/>}/> {'New Inventory Sync Session'}
              </ButtonDefault>
            }
        />
    );
  }

  return (
      <Form data={inventorySyncSession} onSubmit={onSubmit}>
        {({data, Bind}) => (
            <SimpleForm>
              {loading && <CircularProgress/>}
              <SimpleFormHeader title={data.title || 'New Inventory Sync Session'}/>
              <SimpleFormContent>
                <Grid>
                  <Cell span={12}>
                    <Bind name="title" validators={validation.create('required')}>
                      <Input label={'Title'}/>
                    </Bind>
                  </Cell>
                  <Cell span={12}>
                    <Bind name="description" validators={validation.create('maxLength:500')}>
                      <Input label={'Description'}
                             description={'Provide a short description here.'}/>
                    </Bind>
                  </Cell>

                  <Cell span={12}>
                    <Bind name="status">
                      <Input label={'Status'}/>
                    </Bind>
                  </Cell>

                  <Cell span={6}>
                    <Bind name="startedAt">
                      <Input label={'Started At'}/>
                    </Bind>
                  </Cell>

                  <Cell span={6}>
                    <Bind name="finishedAt">
                      <Input label={'Finished At'}/>
                    </Bind>
                  </Cell>
                </Grid>

                <Accordion>
                  {inventorySyncSession && inventorySyncSession.locations && inventorySyncSession.locations.map(loc => (
                      <AccordionItem icon={<></>} key={loc.location.id} title={loc.location.name}>
                        <List twoLine>
                          {loc.operations.map(op => (
                              <ListItem key={op.sku}>
                                <ListItemText>
                                  <ListItemTextPrimary>
                                    {op.sku} - {op.result} - OldQty: {op.oldQty} -
                                    NewQty: {op.newQty}
                                  </ListItemTextPrimary>
                                  <ListItemTextSecondary>
                                    {op.at}
                                  </ListItemTextSecondary>

                                </ListItemText>
                              </ListItem>
                          ))}
                        </List>
                      </AccordionItem>
                  ))}
                </Accordion>
              </SimpleFormContent>
            </SimpleForm>
        )}
      </Form>
  );
};

export default InventorySyncSessionsForm;
