import React, { useCallback, useMemo } from 'react';
import { PermissionRendererPlugin } from '@webiny/app-admin/plugins/PermissionRendererPlugin';

// Components for working with forms:
import { Form } from '@webiny/form';
import { Select } from '@webiny/ui/Select';
import { MultiAutoComplete } from '@webiny/ui/AutoComplete';

// UI React Components - let's make it look nice:
import { Grid, Cell } from '@webiny/ui/Grid';
import { AccordionItem } from '@webiny/ui/Accordion';
import { PermissionInfo } from '@webiny/app-admin/components/Permissions';
import { useQuery } from '@apollo/react-hooks';
import { LIST_STORE_LOCATIONS } from '../storeLocations/views/hooks/graphql';
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar';

const PERMISSION_NAME = 'orders';

export default new PermissionRendererPlugin({
  render(props) {
    // `value` represents an array of all permission objects selected for the
    // security group we're currently editing. To apply changes to the `value`
    // array, we use the provided `onChange` callback.
    const { value, onChange } = props;

    // Callback that gets triggered whenever a form element has changed.
    // If needed, additional object manipulations can be performed too.

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { showSnackbar } = useSnackbar();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const listQuery = useQuery(LIST_STORE_LOCATIONS, {
      variables: {},
      onError: e => showSnackbar(e.message)
    });

    const { data: storeLocations = [] } = listQuery.loading
      ? {}
      : listQuery?.data?.storeLocations?.listStoreLocations || {};

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const onFormChange = useCallback(
      data => {
        // Let's filter out the `car-manufacturer` permission object.
        // It's just easier to build a new one from scratch.
        const newPermissions = value.filter(item => item.name !== PERMISSION_NAME);

        // We only want the permissions object to end up in the `value` array if
        // we have a value in `rwd` or `specialFeature` properties.
        if (data.rwd || data.specialFeature) {
          newPermissions.push(data);
        }

        // Finally, call the `onChange` callback to assign the permissions
        // object into the `value`.
        onChange(newPermissions);
      },
      [value]
    );

    // Set up default form data, which happens once the security group data
    // has been retrieved from the GraphQL API.

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const defaultFormData = useMemo(() => {
      return value.find(item => item.name === PERMISSION_NAME) || { name: PERMISSION_NAME };
    }, [value]);

    // We are using a couple of different React components to get the job done:
    // - for a nicer UI - AccordionItem, Grid, Cell, and PermissionInfo components
    // - for working with forms - Form, Bind, Select, and Switch components
    return (
      <AccordionItem icon={<span></span>} title={'Orders'} description={'Manage Orders app access permissions.'}>
        <Form data={defaultFormData} onChange={onFormChange}>
          {({ Bind }) => (
            <Grid>
              <Cell span={6}>
                <PermissionInfo title={'Access Level'} />
              </Cell>
              <Cell span={6}>
                <Grid>
                  <Cell span={12}>
                    <Bind name={'rwd'}>
                      <Select label={'Access Level'}>
                        <option value={''}>{'No Access'}</option>
                        <option value={'r'}>{'Read'}</option>
                        <option value={'rw'}>{'Read, write'}</option>
                        <option value={'rwd'}>{'Read, write, delete'}</option>
                      </Select>
                    </Bind>
                  </Cell>
                  <Cell span={12}>
                    <Bind name={'storeLocations'}>
                      <MultiAutoComplete
                        options={(storeLocations || []).map(l => ({ name: l.name, id: l.id }))}
                        label="Store Locations"
                        disabled={false}
                        description="Choose one or more store locations."
                      />
                    </Bind>
                  </Cell>
                </Grid>
              </Cell>
            </Grid>
          )}
        </Form>
      </AccordionItem>
    );
  }
});
