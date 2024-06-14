import { InventoryItemEntity } from '@purity/core/inventoryItems/types';
/**
 * Package mdbid is missing types.
 */
import { InventoryItem } from '@purity/core/inventoryItems/entities';
import InventoryItemsResolver from './InventoryItemsResolver';

/**
 * Contains base `createInventoryItem`, `updateInventoryItem`, and `deleteInventoryItem` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement custom data validation and security-related checks.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */

interface CreateInventoryItemParams {
  data: {
    asin: string;
    sku: string;
    productName: string;
  };
}

interface UpdateInventoryItemParams {
  id: string;
  data: {
    asin: string;
    sku: string;
    productName: string;
  };
}

interface DeleteInventoryItemParams {
  id: string;
}

interface InventoryItemsMutation {
  createInventoryItem(params: CreateInventoryItemParams): Promise<InventoryItemEntity>;
  updateInventoryItem(params: UpdateInventoryItemParams): Promise<InventoryItemEntity>;
  deleteInventoryItem(params: DeleteInventoryItemParams): Promise<InventoryItemEntity>;
  deleteAllInventoryItems(): Promise<void>;
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class InventoryItemsMutationImplementation
  extends InventoryItemsResolver
  implements InventoryItemsMutation
{
  /**
   * Creates and returns a new InventoryItem entry.
   * @param data
   */
  async createInventoryItem({}: CreateInventoryItemParams): Promise<InventoryItemEntity> {
    return null;
  }

  /**
   * Updates and returns an existing InventoryItem entry.
   * @param id
   * @param data
   */
  async updateInventoryItem({}: UpdateInventoryItemParams) {
    return null;
  }

  /**
   * Deletes and returns an existing InventoryItem entry.
   * @param id
   */
  async deleteInventoryItem({ id }: DeleteInventoryItemParams) {
    // If entry is not found, we throw an error.
    const { Item: inventoryItem } = await InventoryItem.get({ PK: this.getPK(), SK: id });
    if (!inventoryItem) {
      throw new Error(`InventoryItem "${id}" not found.`);
    }

    // Will throw an error if something goes wrong.
    await InventoryItem.delete(inventoryItem);

    return inventoryItem;
  }

  /**
   * Deletes all existing InventoryItem entries
   */
  async deleteAllInventoryItems(): Promise<void> {
    InventoryItem.deleteBatch({
      PK: this.getPK()
    });
  }
}
