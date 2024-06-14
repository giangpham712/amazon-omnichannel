import React, { useMemo } from 'react';
import { Form } from '@webiny/form';
import { Grid, Cell } from '@webiny/ui/Grid';
import { CircularProgress } from '@webiny/ui/Progress';
import { SimpleForm, SimpleFormContent } from '@webiny/app-admin/components/SimpleForm';
import { Input } from '@webiny/ui/Input';
import { Dialog, DialogContent, DialogTitle, DialogActions, DialogAccept, DialogCancel } from '@webiny/ui/Dialog';
import { validation } from '@webiny/validation';
import { StoreLocationEntity } from '@purity/core/storeLocations/types';
import { InventoryItemEntity } from '@purity/core/inventoryItems';

interface CreatePackagesDialogProps {
  order: any;
  storeLocation: StoreLocationEntity;
  inventoryItems: InventoryItemEntity[];
  open: boolean;
  onClose: Function;
  loading: boolean;
  onSubmit: (formData) => Promise<void>;
}

const CreatePackagesDialog: React.FC<CreatePackagesDialogProps> = ({
  inventoryItems,
  open,
  onClose,
  loading,
  onSubmit
}: CreatePackagesDialogProps) => {
  const formRef = React.createRef<typeof Form>();

  const inventoryItem = inventoryItems && inventoryItems.length > 0 ? inventoryItems[0] : null;

  const shipmentPackage = useMemo(() => {
    if (inventoryItem) {
      return {
        width: inventoryItem.productInfo.widthCm || 5,
        widthUnit: 'CM',
        height: inventoryItem.productInfo.heightCm || 5,
        heightUnit: 'CM',
        weight: inventoryItem.productInfo.shippingWeightG || 5,
        weightUnit: 'grams',
        length: inventoryItem.productInfo.lengthCm || 5,
        lengthUnit: 'CM'
      };
    } else {
      return {
        widthUnit: 'CM',
        heightUnit: 'CM',
        weightUnit: 'grams',
        lengthUnit: 'CM'
      };
    }
  }, [inventoryItem]);

  return (
    <Form data={shipmentPackage} ref={formRef} onSubmit={onSubmit}>
      {({ submit, Bind }) => (
        <Dialog open={open}>
          <DialogTitle>Create Packages</DialogTitle>
          <DialogContent>
            <SimpleForm noElevation={true}>
              {loading && <CircularProgress />}
              <SimpleFormContent>
                <Grid>
                  <Cell span={12}></Cell>
                  <Cell span={6}>
                    <Bind name="width" validators={validation.create('required')}>
                      <Input label={'Width'} />
                    </Bind>
                  </Cell>
                  <Cell span={6}>
                    <Bind name="widthUnit" validators={validation.create('required')}>
                      <Input label={'Width Unit'} />
                    </Bind>
                  </Cell>
                  <Cell span={6}>
                    <Bind name="height" validators={validation.create('required')}>
                      <Input label={'Height'} />
                    </Bind>
                  </Cell>
                  <Cell span={6}>
                    <Bind name="heightUnit" validators={validation.create('required')}>
                      <Input label={'Height Unit'} />
                    </Bind>
                  </Cell>
                  <Cell span={6}>
                    <Bind name="length" validators={validation.create('required')}>
                      <Input label={'Length'} />
                    </Bind>
                  </Cell>
                  <Cell span={6}>
                    <Bind name="lengthUnit" validators={validation.create('required')}>
                      <Input label={'Length Unit'} />
                    </Bind>
                  </Cell>
                  <Cell span={6}>
                    <Bind name="weight" validators={validation.create('required')}>
                      <Input label={'Weight'} />
                    </Bind>
                  </Cell>
                  <Cell span={6}>
                    <Bind name="weightUnit" validators={validation.create('required')}>
                      <Input label={'Weight Unit'} />
                    </Bind>
                  </Cell>
                </Grid>
              </SimpleFormContent>
            </SimpleForm>
          </DialogContent>
          <DialogActions>
            <DialogCancel disabled={loading} onClick={() => onClose()}>
              Cancel
            </DialogCancel>
            <DialogAccept disabled={loading} onClick={ev => submit(ev)}>
              OK
            </DialogAccept>
          </DialogActions>
        </Dialog>
      )}
    </Form>
  );
};

export default CreatePackagesDialog;
