import WebinyError from '@webiny/error';
import { Order } from '@purity/core/orders/types';
import { orderEntity, getPK } from '@purity/core/orders/entities';
import { SpExternalFulfillmentShipmentPackage } from '@purity/selling-partner/types';
/**
 * Package mdbid is missing types.
 */

import OrdersResolver from './OrdersResolver';

/**
 * Contains base `createOrder`, `updateOrder`, and `deleteOrder` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement custom data validation and security-related checks.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */

interface CreateOrderParams {
  data: {
    shipmentId: string;
  };
}

interface UpdateOrderParams {
  id: string;
  data: {
    shopifyOrder: {
      orderId: number;
      orderNumber: string;
      shopifyDomain: string;
    };
  };
}

interface ConfirmOrderParams {
  id: string;
  data: {};
}

interface RefreshOrderParams {
  id: string;
}

interface RejectOrderParams {
  id: string;
  data: {
    reason: string;
  };
}

interface DeleteOrderParams {
  id: string;
}

interface ArchiveOrderParams {
  id: string;
}

interface CreatePackagesParams {
  id: string;
  data: {
    packages: {
      length: number;
      lengthUnit: string;
      width: number;
      widthUnit: string;
      height: number;
      heightUnit: string;
      weight: number;
      weightUnit: string;
    }[];
  };
}

interface GenerateShippingLabelParams {
  id: string;
}

interface ShipCompleteParams {
  id: string;
  packageIds: string[];
}

interface CreateShopifyOrderParams {
  id: string;
}

interface OrdersMutation {
  createOrder(params: CreateOrderParams): Promise<Order>;
  updateOrder(params: UpdateOrderParams): Promise<Order>;
  deleteOrder(params: DeleteOrderParams): Promise<Order>;
  archiveOrder(params: ArchiveOrderParams): Promise<Order>;
  confirmOrder(params: ConfirmOrderParams): Promise<Order>;
  rejectOrder(params: RejectOrderParams): Promise<Order>;
  refreshOrder(params: RefreshOrderParams): Promise<Order>;
  createPackages(params: CreatePackagesParams): Promise<Order>;
  generateShippingLabel(params: GenerateShippingLabelParams): Promise<Order>;
  createShopifyOrder(params: CreateShopifyOrderParams): Promise<any>;
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class OrdersMutationImplementation extends OrdersResolver implements OrdersMutation {
  constructor(context) {
    super(context);
  }

  /**
   * Creates and returns a new Order entry.
   * @param data
   */
  async createOrder({}: CreateOrderParams) {
    return null;
  }

  async updateOrder({ id, data }: UpdateOrderParams): Promise<Order> {
    const order = await this.ordersCrud.getOrderById(id);
    if (!order) {
      throw new Error(`Order "${id}" not found.`);
    }

    const updatedOrder = await this.ordersCrud.updateOrder(id, {
      ...data
    });

    return updatedOrder;
  }

  /**
   * Reject order
   * @param data
   */
  async confirmOrder({ id }: ConfirmOrderParams) {
    // If our GraphQL API uses Webiny Security Framework, we can retrieve the
    // currently logged in identity and assign it to the `createdBy` property.
    // https://www.webiny.com/docs/key-topics/security-framework/introduction
    const { security } = this.context;

    const identity = await security.getIdentity();

    const order = await this.ordersCrud.getOrderById(id);
    if (!order) {
      throw new Error(`Order "${id}" not found.`);
    }

    try {
      // Send Confirm Order request to SP API
      await this.sellingPartner.confirmShipment(order.shipmentId);
    } catch (ex) {
      console.log(ex);
      throw (
        (new WebinyError(ex.message || 'Could not confirm shipment.'),
        ex.code || 'CONFIRM_SP_SHIPMENT_ERROR',
        {
          shipmentId: order.shipmentId
        })
      );
    }

    let updatedOrder;
    try {
      updatedOrder = await this.ordersCrud.updateOrder(order.id, { status: 'CONFIRMED' });
    } catch (ex) {
      throw new WebinyError(
        ex.message || 'Could not update order in DynamoDB table.',
        ex.code || 'UPDATE_ORDER_ERROR',
        {
          error: ex,
          order
        }
      );
    }

    return updatedOrder;
  }

  /**
   * Reject order
   * @param data
   */
  async rejectOrder({ id, data: { reason } }: RejectOrderParams) {
    // If our GraphQL API uses Webiny Security Framework, we can retrieve the
    // currently logged in identity and assign it to the `createdBy` property.
    // https://www.webiny.com/docs/key-topics/security-framework/introduction
    const { security } = this.context;

    const identity = await security.getIdentity();

    const order = await this.ordersCrud.getOrderById(id);
    if (!order) {
      throw new Error(`Order "${id}" not found.`);
    }

    try {
      // Send Confirm Order request to SP API
      await this.sellingPartner.rejectShipment(
        order.shipmentId,
        order.lineItems.map(lineItem => ({
          lineItem: {
            id: lineItem.id,
            quantity: lineItem.numberOfUnits
          },
          reason: 'OUT_OF_STOCK'
        }))
      );
    } catch (ex) {
      throw (
        (new WebinyError(ex.message || 'Could not reject shipment.'),
        ex.code || 'REJECT_SP_SHIPMENT_ERROR',
        {
          shipmentId: order.shipmentId
        })
      );
    }

    let updatedOrder;
    try {
      updatedOrder = await this.ordersCrud.updateOrder(order.id, { status: 'CANCELLED' });
    } catch (ex) {
      throw new WebinyError(
        ex.message || 'Could not update order in DynamoDB table.',
        ex.code || 'UPDATE_ORDER_ERROR',
        {
          error: ex,
          order
        }
      );
    }

    return updatedOrder;
  }

  /**
   * Deletes and returns an existing Order entry.
   * @param id
   */
  async deleteOrder({ id }: DeleteOrderParams) {
    // If entry is not found, we throw an error.
    const order = await this.ordersCrud.getOrderById(id);
    if (!order) {
      throw new Error(`Order "${id}" not found.`);
    }

    console.log(order);

    // Will throw an error if something goes wrong.
    await orderEntity.delete({
      PK: `${getPK()}#${id}`,
      SK: 'O'
    });

    return order;
  }

  async refreshOrder({ id }) {
    // If entry is not found, we throw an error.
    const order = await this.ordersCrud.getOrderById(id);
    if (!order) {
      throw new Error(`Order "${id}" not found.`);
    }

    const {
      lineItems,
      packages,
      locationId,
      channelName,
      channelLocationId,
      metadata,
      shippingInfo,
      creationDateTime,
      lastUpdatedDateTime,
      status
    } = await this.sellingPartner.getShipment(order.shipmentId);

    const shippingLabelMap = {};
    const invoiceMap = {};

    for (const shipmentPackage of packages || []) {
      try {
        const invoice = await this.sellingPartner.getInvoice(order.shipmentId, shipmentPackage.id);
        if (invoice) {
          invoiceMap[shipmentPackage.id] = invoice;
        }
      } catch (e) {
        //
      }

      try {
        const shippingLabel = await this.sellingPartner.getShippingLabel(order.shipmentId, shipmentPackage.id);
        if (shippingLabel) {
          shippingLabelMap[shipmentPackage.id] = shippingLabel;
        }
      } catch (e) {
        //
      }
    }

    const update = {
      status,
      shipmentLocationId: locationId,
      channelName,
      channelLocationId,
      metadata,
      lineItems: lineItems.map(l => {
        const { id, merchantSku, numberOfUnits } = l;
        return {
          id,
          merchantSku,
          numberOfUnits
        };
      }),
      packages: packages?.map(p => {
        const { id, dimensions, packageLineItems, status, weight, hazmatLabels } = p;
        return {
          id,
          dimensions,
          packageLineItems,
          status,
          weight,
          hazmatLabels,
          shippingLabel: shippingLabelMap[id],
          invoice: invoiceMap[id]
        };
      }),
      shippingInfo,
      creationDateTime,
      lastUpdatedDateTime
    };

    const updatedOrder = await this.ordersCrud.updateOrder(id, update);

    return updatedOrder;
  }

  async archiveOrder({ id }: ArchiveOrderParams) {
    const updatedOrder = await this.ordersCrud.updateOrder(id, {
      archived: true
    });

    return updatedOrder;
  }

  async createPackages({ id, data: { packages } }: CreatePackagesParams): Promise<Order> {
    // If entry is not found, we throw an error.
    let order = await this.ordersCrud.getOrderById(id);
    if (!order) {
      throw new Error(`Order "${id}" not found.`);
    }

    if (order.status === 'CONFIRMED') {
      const shipmentPackages: Partial<SpExternalFulfillmentShipmentPackage>[] = packages.map((p, i) => ({
        id: `PACKAGE_${i + 1}`,
        dimensions: {
          length: {
            value: `${p.length}`,
            dimensionUnit: p.lengthUnit
          },
          width: {
            value: `${p.width}`,
            dimensionUnit: p.widthUnit
          },
          height: {
            value: `${p.height}`,
            dimensionUnit: p.heightUnit
          }
        },
        weight: {
          value: `${p.weight}`,
          weightUnit: `${p.weightUnit}`
        },
        hazmatLabels: [],
        packageLineItems: order.lineItems.map((l, j) => ({
          packageLineItem: {
            id: `${j + 1}`
          },
          quantity: l.numberOfUnits,
          serialNumbers: []
        }))
      }));

      try {
        // create packages
        await this.sellingPartner.createPackages(order.shipmentId, shipmentPackages);
        order = await this.ordersCrud.updateOrder(order.id, {
          status: 'PACKAGE_CREATED',
          packages: shipmentPackages.map(sp => ({
            ...sp
          }))
        });
      } catch (ex) {
        throw new WebinyError(
          `Could not create packages for shipment ${order.shipmentId} - ${ex.message}`,
          ex.code || 'CREATE_PACKAGES_ERROR',
          {
            error: ex,
            order,
            shipmentId: order.shipmentId,
            shipmentPackages
          }
        );
      }
    }

    if (order.status === 'PACKAGE_CREATED') {
      const shipmentPackages = order.packages;
      for (const shipmentPackage of shipmentPackages) {
        try {
          // get shipping options
          await this.sellingPartner.retrieveShippingOptions(order.shipmentId, shipmentPackage.id);
        } catch (ex) {
          throw new WebinyError(
            `Could not retrieve shipping options for package ${shipmentPackage.id} in shipment ${order.shipmentId} - ${ex.message}`,
            ex.code || 'RETRIEVE_SHIPPING_OPTIONS_ERROR',
            {
              error: ex,
              shipmentId: order.shipmentId,
              packageId: shipmentPackage.id
            }
          );
        }
      }

      order = await this.ordersCrud.updateOrder(order.id, { status: 'PICKUP_SLOT_RETRIEVED' });
    }

    if (order.status === 'PICKUP_SLOT_RETRIEVED') {
      const shipmentPackages = order.packages;
      for (const shipmentPackage of shipmentPackages) {
        try {
          // generate invoice
          await this.sellingPartner.generateInvoice(order.shipmentId, shipmentPackage.id);
        } catch (ex) {
          throw new WebinyError(
            `Could not generate invoice for package ${shipmentPackage.id} in shipment ${order.shipmentId} - ${ex.message}`,
            ex.code || 'GENERATE_INVOICE_ERROR',
            {
              error: ex,
              shipmentId: order.shipmentId,
              packageId: shipmentPackage.id
            }
          );
        }
      }

      order = await this.ordersCrud.updateOrder(order.id, { status: 'INVOICE_GENERATED' });
    }

    return order;
  }

  async generateShippingLabel({ id }: GenerateShippingLabelParams) {
    // If entry is not found, we throw an error.
    const order: Order = await this.ordersCrud.getOrderById(id);
    if (!order) {
      throw new Error(`Order "${id}" not found.`);
    }

    for (const shipmentPackage of order.packages || []) {
      const { document, metadata } = await this.sellingPartner.generateShippingLabel(
        order.shipmentId,
        shipmentPackage.id
      );

      shipmentPackage.shippingLabel = { document, metadata };
    }

    const updatedOrder = await this.ordersCrud.updateOrder(order.id, {
      status: 'SHIPLABEL_GENERATED',
      packages: order.packages
    });

    return updatedOrder;
  }

  async shipComplete({ id, packageIds }: ShipCompleteParams): Promise<Order> {
    // If entry is not found, we throw an error.
    const order: Order = await this.ordersCrud.getOrderById(id);
    if (!order) {
      throw new Error(`Order "${id}" not found.`);
    }

    for (const packageId of packageIds || order.packages.map(p => p.id)) {
      await this.sellingPartner.shipComplete(order.shipmentId, packageId);
    }

    const updatedOrder = await this.ordersCrud.updateOrder(order.id, {
      status: 'SHIPPED'
    });

    return updatedOrder;
  }

  async createShopifyOrder({ id }) {
    const order = await this.ordersCrud.getOrderById(id);
    if (!order) {
      throw new Error(`Order "${id}" not found.`);
    }

    if (order.status !== 'CONFIRMED') {
      // Return error
    }

    return null;
  }
}
