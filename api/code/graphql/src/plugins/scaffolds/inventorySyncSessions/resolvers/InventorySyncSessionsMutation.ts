import { InventorySyncSessionEntity, InventorySyncSession } from '@purity/core/inventorySyncSessions';

/**
 * Package mdbid is missing types.
 */
// @ts-ignore
import mdbid from 'mdbid';
import InventorySyncSessionsResolver from './InventorySyncSessionsResolver';

/**
 * Contains base `createInventorySyncSession`, `updateInventorySyncSession`, and `deleteInventorySyncSession` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement custom data validation and security-related checks.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */

interface CreateInventorySyncSessionParams {
  data: {
    title: string;
    description?: string;
  };
}

interface UpdateInventorySyncSessionParams {
  id: string;
  data: {
    title: string;
    description?: string;
  };
}

interface DeleteInventorySyncSessionParams {
  id: string;
}

interface InventorySyncSessionsMutation {
  createInventorySyncSession(params: CreateInventorySyncSessionParams): Promise<InventorySyncSessionEntity>;
  updateInventorySyncSession(params: UpdateInventorySyncSessionParams): Promise<InventorySyncSessionEntity>;
  deleteInventorySyncSession(params: DeleteInventorySyncSessionParams): Promise<InventorySyncSessionEntity>;
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class InventorySyncSessionsMutationImplementation
  extends InventorySyncSessionsResolver
  implements InventorySyncSessionsMutation
{
  /**
   * Creates and returns a new InventorySyncSession entry.
   * @param data
   */
  async createInventorySyncSession({ data }: CreateInventorySyncSessionParams) {
    // If our GraphQL API uses Webiny Security Framework, we can retrieve the
    // currently logged in identity and assign it to the `createdBy` property.
    // https://www.webiny.com/docs/key-topics/security-framework/introduction
    const { security } = this.context;

    // We use `mdbid` (https://www.npmjs.com/package/mdbid) library to generate
    // a random, unique, and sequential (sortable) ID for our new entry.
    const id = mdbid();

    const identity = await security.getIdentity();
    const inventorySyncSession = {
      ...data,
      PK: this.getPK(),
      SK: id,
      id,
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
    await InventorySyncSession.put(inventorySyncSession);

    return inventorySyncSession;
  }

  /**
   * Updates and returns an existing InventorySyncSession entry.
   * @param id
   * @param data
   */
  async updateInventorySyncSession({ id, data }: UpdateInventorySyncSessionParams) {
    // If entry is not found, we throw an error.
    const { Item: inventorySyncSession } = await InventorySyncSession.get({ PK: this.getPK(), SK: id });
    if (!inventorySyncSession) {
      throw new Error(`InventorySyncSession "${id}" not found.`);
    }

    const updatedInventorySyncSession = { ...inventorySyncSession, ...data };

    // Will throw an error if something goes wrong.
    await InventorySyncSession.update(updatedInventorySyncSession);

    return updatedInventorySyncSession;
  }

  /**
   * Deletes and returns an existing InventorySyncSession entry.
   * @param id
   */
  async deleteInventorySyncSession({ id }: DeleteInventorySyncSessionParams) {
    // If entry is not found, we throw an error.
    const { Item: inventorySyncSession } = await InventorySyncSession.get({ PK: this.getPK(), SK: id });
    if (!inventorySyncSession) {
      throw new Error(`InventorySyncSession "${id}" not found.`);
    }

    // Will throw an error if something goes wrong.
    await InventorySyncSession.delete(inventorySyncSession);

    return inventorySyncSession;
  }
}
