import {
  GET_STORE_LOCATION,
  CREATE_STORE_LOCATION,
  DELETE_STORE_LOCATION,
  LIST_STORE_LOCATIONS,
  UPDATE_STORE_LOCATION
} from './graphql/storeLocations';
import { request } from 'graphql-request';

/**
 * An example of an end-to-end (E2E) test. You can use these to test if the overall cloud infrastructure
 * setup is working. That's why, here we're not executing the handler code directly, but issuing real
 * HTTP requests over to the deployed Amazon Cloudfront distribution. These tests provide the highest
 * level of confidence that our application is working, but they take more time in order to complete.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#crude2etestts
 */

const query = async ({ query = '', variables = {} } = {}) => {
  return request(process.env.API_URL + '/graphql', query, variables);
};

let testStoreLocations: any[] = [];

describe('StoreLocations CRUD tests (end-to-end)', () => {
  beforeEach(async () => {
    for (let i = 0; i < 3; i++) {
      testStoreLocations.push(
        await query({
          query: CREATE_STORE_LOCATION,
          variables: {
            data: {
              title: `StoreLocation ${i}`,
              description: `StoreLocation ${i}'s description.`
            }
          }
        }).then((response: any) => response.storeLocations.createStoreLocation)
      );
    }
  });

  afterEach(async () => {
    for (let i = 0; i < 3; i++) {
      try {
        await query({
          query: DELETE_STORE_LOCATION,
          variables: {
            id: testStoreLocations[i].id
          }
        });
      } catch {
        // Some of the entries might've been deleted during runtime.
        // We can ignore thrown errors.
      }
    }
    testStoreLocations = [];
  });

  it('should be able to perform basic CRUD operations', async () => {
    // 1. Now that we have storeLocations created, let's see if they come up in a basic listStoreLocations query.
    const [storeLocation0, storeLocation1, storeLocation2] = testStoreLocations;

    await query({
      query: LIST_STORE_LOCATIONS,
      variables: { limit: 3 }
    }).then((response: any) =>
      expect(response.storeLocations.listStoreLocations).toMatchObject({
        data: [storeLocation2, storeLocation1, storeLocation0],
        meta: {
          limit: 3
        }
      })
    );

    // 2. Delete storeLocation 1.
    await query({
      query: DELETE_STORE_LOCATION,
      variables: {
        id: storeLocation1.id
      }
    });

    await query({
      query: LIST_STORE_LOCATIONS,
      variables: {
        limit: 2
      }
    }).then((response: any) =>
      expect(response.storeLocations.listStoreLocations).toMatchObject({
        data: [storeLocation2, storeLocation0],
        meta: {
          limit: 2
        }
      })
    );

    // 3. Update storeLocation 0.
    await query({
      query: UPDATE_STORE_LOCATION,
      variables: {
        id: storeLocation0.id,
        data: {
          title: 'StoreLocation 0 - UPDATED',
          description: `StoreLocation 0's description - UPDATED.`
        }
      }
    }).then((response: any) =>
      expect(response.storeLocations.updateStoreLocation).toEqual({
        id: storeLocation0.id,
        title: 'StoreLocation 0 - UPDATED',
        description: `StoreLocation 0's description - UPDATED.`
      })
    );

    // 4. Get storeLocation 0 after the update.
    await query({
      query: GET_STORE_LOCATION,
      variables: {
        id: storeLocation0.id
      }
    }).then((response: any) =>
      expect(response.storeLocations.getStoreLocation).toEqual({
        id: storeLocation0.id,
        title: 'StoreLocation 0 - UPDATED',
        description: `StoreLocation 0's description - UPDATED.`
      })
    );
  });
});
