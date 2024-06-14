import React from 'react';
import { Form } from '@webiny/form';
import { Grid, Cell } from '@webiny/ui/Grid';
import { Typography } from '@webiny/ui/Typography';
import { Accordion, AccordionItem } from '@webiny/ui/Accordion';
import { Input } from '@webiny/ui/Input';
import { ButtonDefault, ButtonIcon, ButtonPrimary, ButtonSecondary } from '@webiny/ui/Button';
import { Checkbox } from '@webiny/ui/Checkbox';
import Stepper from 'react-stepper-horizontal';
import {
  List,
  ListItem,
  ListItemGraphic,
  ListItemText,
  ListItemTextPrimary,
  ListItemTextSecondary,
  ListItemMeta
} from '@webiny/ui/List';
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
import { useOrdersForm } from './hooks/useOrdersForm';
import CreatePackagesDialog from './OrdersForm/CreatePackagesDialog';
import OrderActions from './OrdersForm/OrderActions';

const printPreview = (data, type = 'application/pdf') => {
  let blob = null;
  blob = b64toBlob(data, type);
  const blobURL = URL.createObjectURL(blob);
  const theWindow = window.open(blobURL);
  const theDoc = theWindow.document;
  const theScript = document.createElement('script');
  function injectThis() {
    window.print();
  }
  theScript.innerHTML = `window.onload = ${injectThis.toString()};`;
  theDoc.body.appendChild(theScript);
};

const b64toBlob = (content, contentType) => {
  contentType = contentType || '';
  const sliceSize = 512;
  // method which converts base64 to binary
  const byteCharacters = window.atob(content);

  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, {
    type: contentType
  }); // statement which creates the blob
  return blob;
};

/**
 * Renders a form which enables creating new or editing existing Order entries.
 * Includes two basic fields - title (required) and description.
 * The form submission-related functionality is located in the `useOrdersForm` React hook.
 */
const OrdersForm: React.FC = () => {
  const {
    showCreatePackages,
    setShowCreatePackages,
    loading,
    emptyViewIsShown,
    currentOrder,
    storeLocation,
    inventoryItems,
    order,
    onCreatePackages,
    ...orderActions
  } = useOrdersForm();

  // Render "No content" selected view.
  if (emptyViewIsShown) {
    return (
      <EmptyView
        title={'Click on the left side list to display Orders details or create a...'}
        action={
          <ButtonDefault onClick={currentOrder}>
            <ButtonIcon icon={<AddIcon />} /> {'New Order'}
          </ButtonDefault>
        }
      />
    );
  }

  const inventoryItemMapBySku = inventoryItems?.reduce((result, inventoryItem) => {
    result[inventoryItem.sku] = inventoryItem;
    return result;
  }, {});

  const recommendedShipMethod = order?.shippingInfo?.recommendedShipMethod;

  return (
    <Form
      data={{ ...order, shipmentLocationName: storeLocation?.name, submitAction: null }}
      onSubmit={() => {
        //
      }}
    >
      {({ data, Bind }) => {
        if (data.status === 'SHIPPED' && data.shippingInfo.recommendedShipMethod === 'AMZL_US_SP_PICKUP') {
          data.status = 'CUSTOMER PICKED UP';
        }

        return (
          <SimpleForm>
            {loading && <CircularProgress />}
            <SimpleFormHeader
              title={
                <div>
                  <Typography use="headline5">{`${data.metadata?.buyerOrderId}` || 'New Order'}</Typography> <br />
                  {recommendedShipMethod === 'AMZL_US_SP_RUSH' && <Typography use="subtitle1">DELIVERY</Typography>}
                  {recommendedShipMethod === 'AMZL_US_SP_PICKUP' && <Typography use="subtitle1">CUSTOMER</Typography>}
                </div>
              }
            >
              <div>
                {order && (
                  <OrderActions order={order} setShowCreatePackages={setShowCreatePackages} {...orderActions} />
                )}
              </div>
            </SimpleFormHeader>
            <SimpleFormContent>
              <div style={{ padding: '10px' }}>
                <div style={{ padding: '20px 10px', display: 'none' }}>
                  <Stepper
                    circleTop={0}
                    steps={[
                      { title: 'Step One', icon: '' },
                      { title: 'Step Two' },
                      { title: 'Step Three' },
                      { title: 'Step Four' }
                    ]}
                    activeStep={1}
                  />
                </div>

                <Accordion>
                  <AccordionItem open={true} description="" icon={null} title="General">
                    <div>
                      <Grid>
                        <Cell span={6}>
                          <Bind name="shipmentId" validators={validation.create('required')}>
                            <Input label={'Shipment ID'} />
                          </Bind>
                        </Cell>
                        <Cell span={6}>
                          <Bind name="status" validators={validation.create('required')}>
                            <Input label={'Status'} />
                          </Bind>
                        </Cell>
                        <Cell span={6}>
                          <Bind name="shipmentLocationName">
                            <Input label={'Location'} />
                          </Bind>
                        </Cell>
                        <Cell span={6}>
                          <Bind name="channelName">
                            <Input label={'Channel Name'} />
                          </Bind>
                        </Cell>
                        <Cell span={6}>
                          <Bind name="channelLocationId">
                            <Input label={'Channel Location ID'} />
                          </Bind>
                        </Cell>
                      </Grid>
                      <Grid>
                        <Cell span={6}>
                          <Bind name="creationDateTime">
                            <Input label={'Creation Time'} description={''} />
                          </Bind>
                        </Cell>
                        <Cell span={6}>
                          <Bind name="lastUpdatedDateTime">
                            <Input label={'Last Update Time'} description={''} />
                          </Bind>
                        </Cell>
                      </Grid>
                    </div>
                  </AccordionItem>
                  <AccordionItem description="" icon={null} title="Line Items">
                    <div>
                      <List twoLine>
                        {order &&
                          order.lineItems.map(lineItem => {
                            const inventoryItem = inventoryItemMapBySku[lineItem.merchantSku];
                            return (
                              <ListItem key={lineItem.id}>
                                <ListItemGraphic>
                                  <img
                                    style={{ maxHeight: '50px', maxWidth: '50px' }}
                                    src={inventoryItem?.shopifyVariant?.product?.featureImage}
                                  />
                                </ListItemGraphic>
                                <ListItemText>
                                  <ListItemTextPrimary>
                                    {lineItem.merchantSku} - {inventoryItem?.productName}{' '}
                                    {inventoryItem?.shopifyVariant?.title &&
                                    inventoryItem?.shopifyVariant?.title !== 'Default Title'
                                      ? ' - ' + inventoryItem?.shopifyVariant?.title
                                      : ''}
                                  </ListItemTextPrimary>
                                  <ListItemTextSecondary>Quantity: {lineItem.numberOfUnits}</ListItemTextSecondary>
                                </ListItemText>
                              </ListItem>
                            );
                          })}
                      </List>
                    </div>
                  </AccordionItem>
                  <AccordionItem description="" icon={null} title="Packages">
                    <div>
                      <List twoLine>
                        {order &&
                          order.packages &&
                          order.packages.map(p => (
                            <ListItem key={p.id}>
                              <ListItemText>
                                <ListItemTextPrimary>ID: {p.id}</ListItemTextPrimary>
                              </ListItemText>
                              <ListItemMeta>
                                {p?.invoice?.document?.content && (
                                  <ButtonSecondary
                                    onClick={() => {
                                      printPreview(p.invoice.document.content, 'image/png');
                                    }}
                                  >
                                    Download Invoice
                                  </ButtonSecondary>
                                )}
                                &nbsp;&nbsp;
                                {p?.shippingLabel?.document?.content && (
                                  <ButtonSecondary
                                    onClick={() => {
                                      printPreview(p.shippingLabel.document.content, 'image/png');
                                    }}
                                  >
                                    Download Shipping Label
                                  </ButtonSecondary>
                                )}
                              </ListItemMeta>
                            </ListItem>
                          ))}
                      </List>
                    </div>
                  </AccordionItem>
                  <AccordionItem description="" icon={null} title="Shipping Info">
                    <div>
                      <Grid>
                        <Cell span={6}>
                          <Bind name="shippingInfo.recommendedShipMethod">
                            <Input label={'Recommended Shipping Method'} description={''} />
                          </Bind>
                        </Cell>
                        <Cell span={6}>
                          <Bind name="shippingInfo.expectedShippingDateTime">
                            <Input label={'Expected Shipping Time'} description={''} />
                          </Bind>
                        </Cell>

                        <Cell span={6}>
                          <Bind name="shippingInfo.shipToAddress.name">
                            <Input label={'Addressee'} description={''} />
                          </Bind>
                        </Cell>
                        <Cell span={6}>
                          <Bind name="shippingInfo.shipToAddress.phoneNumber">
                            <Input label={'Phone Number'} description={''} />
                          </Bind>
                        </Cell>
                        <Cell span={4}>
                          <Bind name="shippingInfo.shipToAddress.addressLine1">
                            <Input label={'Address 1'} description={''} />
                          </Bind>
                        </Cell>
                        <Cell span={4}>
                          <Bind name="shippingInfo.shipToAddress.addressLine2">
                            <Input label={'Address 2'} description={''} />
                          </Bind>
                        </Cell>
                        <Cell span={4}>
                          <Bind name="shippingInfo.shipToAddress.addressLine3">
                            <Input label={'Address 3'} description={''} />
                          </Bind>
                        </Cell>
                        <Cell span={3}>
                          <Bind name="shippingInfo.shipToAddress.city">
                            <Input label={'City'} description={''} />
                          </Bind>
                        </Cell>
                        <Cell span={2}>
                          <Bind name="shippingInfo.shipToAddress.countryCode">
                            <Input label={'Country Code'} description={''} />
                          </Bind>
                        </Cell>
                        <Cell span={3}>
                          <Bind name="shippingInfo.shipToAddress.district">
                            <Input label={'District'} description={''} />
                          </Bind>
                        </Cell>
                        <Cell span={2}>
                          <Bind name="shippingInfo.shipToAddress.state">
                            <Input label={'State'} description={''} />
                          </Bind>
                        </Cell>
                        <Cell span={2}>
                          <Bind name="shippingInfo.shipToAddress.postalCode">
                            <Input label={'Postal Code'} description={''} />
                          </Bind>
                        </Cell>
                      </Grid>
                    </div>
                  </AccordionItem>
                  <AccordionItem description="" icon={null} title="Metadata">
                    <Grid>
                      <Cell span={6}>
                        <Bind name="metadata.buyerOrderId">
                          <Input label={'Buyer Order ID'} description={''} />
                        </Bind>
                      </Cell>
                      <Cell span={6}>
                        <Bind name="metadata.priority">
                          <Checkbox label={'Priority'} description={''} />
                        </Bind>
                      </Cell>
                      <Cell span={6}>
                        <Bind name="metadata.shipmentType">
                          <Input label={'Shipment Type'} description={''} />
                        </Bind>
                      </Cell>
                    </Grid>
                  </AccordionItem>
                  <AccordionItem description="" icon={null} title="System">
                    <Grid>
                      <Cell span={6}>
                        <Bind name="createdOn">
                          <Input label={'Creation Time'} description={''} />
                        </Bind>
                      </Cell>
                      <Cell span={6}>
                        <Bind name="lastUpdatedDateTime">
                          <Input label={'Last Update Time'} description={''} />
                        </Bind>
                      </Cell>
                      <Cell span={6}>
                        <ButtonPrimary
                          style={{ backgroundColor: '#fa5723', color: 'white' }}
                          onClick={orderActions.onArchiveOrder}
                        >
                          Archive Order
                        </ButtonPrimary>
                      </Cell>
                    </Grid>
                  </AccordionItem>
                </Accordion>
              </div>

              <CreatePackagesDialog
                order={order}
                loading={loading}
                storeLocation={storeLocation}
                inventoryItems={inventoryItems}
                open={showCreatePackages}
                onClose={() => setShowCreatePackages(false)}
                onSubmit={async formData => {
                  await onCreatePackages(formData);
                  setShowCreatePackages(false);
                }}
              />
            </SimpleFormContent>
            <SimpleFormFooter>
              {order && <OrderActions order={order} setShowCreatePackages={setShowCreatePackages} {...orderActions} />}
            </SimpleFormFooter>
          </SimpleForm>
        );
      }}
    </Form>
  );
};

export default OrdersForm;
