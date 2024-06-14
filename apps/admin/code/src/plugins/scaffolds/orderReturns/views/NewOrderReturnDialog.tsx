import { useCallback } from 'react';
import { mapValues, sum } from 'lodash';
import { Form } from '@webiny/form';
import { SimpleForm, SimpleFormContent } from '@webiny/app-admin/components/SimpleForm';
import { ButtonPrimary } from '@webiny/ui/Button';
import { Accordion } from '@webiny/ui/Accordion';
import { Input } from '@webiny/ui/Input';
import { Grid, Cell } from '@webiny/ui/Grid';
import { Dialog, DialogCancel, DialogTitle, DialogContent, DialogActions } from '@webiny/ui/Dialog';
import React from 'react';
import { validation } from '@webiny/validation';
import { CREATE_ORDER_RETURN } from './hooks/graphql';

import { useMutation } from '@apollo/react-hooks';
import { useNewOrderReturnDialog } from './hooks/useNewOrderReturnDialog';
import ProcessOrderReturnForm from './ProcessOrderReturnForm';

const NewOrderReturnDialog = ({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
  onProcessReturn: (
    returnId: string,
    itemConditions: {
      sellable?: number;
      defective?: number;
      customerDamaged?: number;
      carrierDamaged?: number;
      fraud?: number;
      wrongItem?: number;
    }
  ) => void;
}) => {
  const { listPendingOrderReturns, loading, returns, setReturns } = useNewOrderReturnDialog();
  const [createOrderReturn] = useMutation(CREATE_ORDER_RETURN, {});

  const processOrderReturn = useCallback(
    async ({ return: { returnId, numberOfUnits }, itemConditions }) => {
      if (sum(Object.values(itemConditions).map((s: string) => parseInt(s) || 0)) > numberOfUnits) {
        return;
      }
      try {
        await createOrderReturn({
          variables: {
            data: {
              returnId,
              itemConditions: mapValues(itemConditions, s => parseInt(s) || 0)
            }
          }
        });

        onClose();
      } catch (e) {
        //
      }
    },
    [createOrderReturn]
  );

  return (
    <Form
      data={{ rmaId: null }}
      onSubmit={async formData => {
        const { rmaId } = formData;
        await listPendingOrderReturns(rmaId);
      }}
    >
      {({ submit, Bind, setValue }) => (
        <Dialog
          open={open}
          onOpen={() => {
            setValue('rmaId', null);
            setReturns([]);
          }}
          onClose={onClose}
        >
          <DialogTitle>Return</DialogTitle>
          <DialogContent>
            <div style={{ width: 800 }}>
              <SimpleForm noElevation={true}>
                <SimpleFormContent>
                  <Grid style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <Cell span={8}>
                      <Bind name="rmaId" validators={validation.create('required')}>
                        <Input label={'Amazon Return ID'} />
                      </Bind>
                    </Cell>
                    <Cell span={4} align={'middle'}>
                      <ButtonPrimary onClick={submit}>Search</ButtonPrimary>
                    </Cell>
                    <Cell span={12}>
                      <div style={{ position: 'relative' }}>
                        {loading && (
                          <div style={{ paddingTop: 40 }} className="webiny-pb-circular-spinner">
                            <div className="webiny-pb-circular-spinner__container">
                              <div className="webiny-pb-circular-spinner__container-loader">Loading...</div>
                            </div>
                          </div>
                        )}
                        {!loading && returns && returns.length > 0 && (
                          <Accordion>
                            {returns.map(item => (
                              <ProcessOrderReturnForm
                                key={item.returnId}
                                item={item}
                                processOrderReturn={processOrderReturn}
                              />
                            ))}
                          </Accordion>
                        )}
                      </div>
                    </Cell>
                  </Grid>
                </SimpleFormContent>
              </SimpleForm>
            </div>
          </DialogContent>
          <DialogActions>
            <DialogCancel onClick={onClose}>Cancel</DialogCancel>
          </DialogActions>
        </Dialog>
      )}
    </Form>
  );
};

export default NewOrderReturnDialog;
