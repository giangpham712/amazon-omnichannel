import { StoreLocationEntity } from '@purity/core/storeLocations/types';
/**
 * Package mdbid is missing types.
 */
// @ts-ignore
import mdbid from 'mdbid';
import StoreLocation from '@purity/core/storeLocations/entities';
import StoreLocationsResolver from './StoreLocationsResolver';
import { EmailType, sendEmail } from '@purity/email';
import { Order, OrderLineItem, OrderMetadata } from '@purity/core/orders/types';
import { InventoryItemEntity } from '@purity/core/inventoryItems';

/**
 * Contains base `createStoreLocation`, `updateStoreLocation`, and `deleteStoreLocation` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement custom data validation and security-related checks.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */

interface CreateStoreLocationParams {
  data: {
    name: string;
    spSupplySourceId: string;
    spSupplySourceCode: string;
    shopifyDomain?: string;
    shopifyLocationId?: string;
    storeAdminEmail?: string;
  };
}

interface UpdateStoreLocationParams {
  id: string;
  data: {
    name: string;
    spSupplySourceId: string;
    spSupplySourceCode: string;
    shopifyDomain?: string;
    shopifyLocationId?: string;
    storeAdminEmail?: string;
  };
}

interface DeleteStoreLocationParams {
  id: string;
}

interface StoreLocationsMutation {
  createStoreLocation(params: CreateStoreLocationParams): Promise<StoreLocationEntity>;
  updateStoreLocation(params: UpdateStoreLocationParams): Promise<StoreLocationEntity>;
  deleteStoreLocation(params: DeleteStoreLocationParams): Promise<StoreLocationEntity>;
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class StoreLocationsMutationImplementation
  extends StoreLocationsResolver
  implements StoreLocationsMutation
{
  /**
   * Creates and returns a new StoreLocation entry.
   * @param data
   */
  async createStoreLocation({ data }: CreateStoreLocationParams) {
    // If our GraphQL API uses Webiny Security Framework, we can retrieve the
    // currently logged in identity and assign it to the `createdBy` property.
    // https://www.webiny.com/docs/key-topics/security-framework/introduction
    const { security } = this.context;

    // We use `mdbid` (https://www.npmjs.com/package/mdbid) library to generate
    // a random, unique, and sequential (sortable) ID for our new entry.
    const id = mdbid();

    const identity = await security.getIdentity();
    const storeLocation = {
      ...data,
      PK: this.getPK(),
      SK: id,
      GSI1_PK: this.getPK(),
      GSI1_SK: data.spSupplySourceId,
      id,
      TYPE: 'storeLocation',
      createdOn: new Date().toISOString(),
      savedOn: new Date().toISOString(),
      createdBy: identity && {
        id: identity.id,
        type: identity.type,
        displayName: identity.displayName
      },
      webinyVersion: process.env.WEBINY_VERSION
    };

    // Will throw an error if something goes wrong.
    await StoreLocation.put(storeLocation);

    return storeLocation;
  }

  /**
   * Updates and returns an existing StoreLocation entry.
   * @param id
   * @param data
   */
  async updateStoreLocation({ id, data }: UpdateStoreLocationParams) {
    // If entry is not found, we throw an error.
    const { Item: storeLocation } = await StoreLocation.get({ PK: this.getPK(), SK: id });
    if (!storeLocation) {
      throw new Error(`StoreLocation "${id}" not found.`);
    }

    const updatedStoreLocation = { ...storeLocation, ...data };

    // Will throw an error if something goes wrong.
    await StoreLocation.update(updatedStoreLocation);

    return updatedStoreLocation;
  }

  /**
   * Deletes and returns an existing StoreLocation entry.
   * @param id
   */
  async deleteStoreLocation({ id }: DeleteStoreLocationParams) {
    // If entry is not found, we throw an error.
    const { Item: storeLocation } = await StoreLocation.get({ PK: this.getPK(), SK: id });
    if (!storeLocation) {
      throw new Error(`StoreLocation "${id}" not found.`);
    }

    // Will throw an error if something goes wrong.
    await StoreLocation.delete(storeLocation);

    return storeLocation;
  }

  async sendTestEmailNotification({ id }: { id: string }) {
    try {
      const { Item: storeLocation } = await StoreLocation.get({ PK: this.getPK(), SK: id });

      console.log(`Sending test order confirmation email to ${storeLocation.storeAdminEmail}.`);

      const sendEmailResult = await sendEmail({
        type: EmailType.OrderConfirmation,
        to: storeLocation.storeAdminEmail?.split(','),
        data: {
          order: {
            id: '',
            shipmentId: 'testshipment',
            metadata: {
              buyerOrderId: '111-2222222-2222222'
            } as OrderMetadata,
            lineItems: [{ merchantSku: '1TESTPRODUCT', numberOfUnits: 1 } as OrderLineItem]
          } as Order,
          items: new Map([
            ['1TESTPRODUCT', { shopifyVariant: { product: { title: 'Test Product' } } } as InventoryItemEntity]
          ])
        }
      });

      console.log(`Sent order cancellation email. Send email result: ${JSON.stringify(sendEmailResult)}`);
    } catch (e) {
      console.warn(`Unable to send email notification. Error: ${e}.`);
    }
  }
}
