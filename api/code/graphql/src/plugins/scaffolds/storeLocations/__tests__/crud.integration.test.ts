import { handler } from '~/index';
import {
  GET_STORE_LOCATION,
  CREATE_STORE_LOCATION,
  DELETE_STORE_LOCATION,
  LIST_STORE_LOCATIONS,
  UPDATE_STORE_LOCATION
} from './graphql/storeLocations';

/**
 * An example of an integration test. You can use these to test your GraphQL resolvers, for example,
 * ensure they are correctly interacting with the database and other cloud infrastructure resources
 * and services. These tests provide a good level of confidence that our application is working, and
 * can be reasonably fast to complete.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#crudintegrationtestts
 */

const query = ({ query = '', variables = {} } = {}) => {
  return handler({
    httpMethod: 'POST',
    headers: {},
    body: JSON.stringify({
      query,
      variables
    })
  }).then((response: any) => JSON.parse(response.body));
};

let testStoreLocations: any[] = [];

describe('StoreLocations CRUD tests (integration)', () => {
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
        }).then((response: any) => response.data.storeLocations.createStoreLocation)
      );
    }
  });

  afterEach(async () => {
    for (let i = 0; i < 3; i++) {
      await query({
        query: DELETE_STORE_LOCATION,
        variables: {
          id: testStoreLocations[i].id
        }
      });
    }
    testStoreLocations = [];
  });

  it('should be able to perform basic CRUD operations', async () => {
    // 1. Now that we have storeLocations created, let's see if they come up in a basic listStoreLocations query.
    const [storeLocation0, storeLocation1, storeLocation2] = testStoreLocations;

    await query({ query: LIST_STORE_LOCATIONS }).then((response: any) =>
      expect(response.data.storeLocations.listStoreLocations).toEqual({
        data: [storeLocation2, storeLocation1, storeLocation0],
        meta: {
          after: null,
          before: null,
          limit: 10
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
      query: LIST_STORE_LOCATIONS
    }).then((response: any) =>
      expect(response.data.storeLocations.listStoreLocations).toEqual({
        data: [storeLocation2, storeLocation0],
        meta: {
          after: null,
          before: null,
          limit: 10
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
      expect(response.data.storeLocations.updateStoreLocation).toEqual({
        id: storeLocation0.id,
        title: 'StoreLocation 0 - UPDATED',
        description: `StoreLocation 0's description - UPDATED.`
      })
    );

    // 5. Get storeLocation 0 after the update.
    await query({
      query: GET_STORE_LOCATION,
      variables: { id: storeLocation0.id }
    }).then((response: any) =>
      expect(response.data.storeLocations.getStoreLocation).toEqual({
        id: storeLocation0.id,
        title: 'StoreLocation 0 - UPDATED',
        description: `StoreLocation 0's description - UPDATED.`
      })
    );
  });

  test('should be able to use cursor-based pagination (desc)', async () => {
    const [storeLocation0, storeLocation1, storeLocation2] = testStoreLocations;

    await query({
      query: LIST_STORE_LOCATIONS,
      variables: {
        limit: 2
      }
    }).then((response: any) =>
      expect(response.data.storeLocations.listStoreLocations).toEqual({
        data: [storeLocation2, storeLocation1],
        meta: {
          after: storeLocation1.id,
          before: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_STORE_LOCATIONS,
      variables: {
        limit: 2,
        after: storeLocation1.id
      }
    }).then((response: any) =>
      expect(response.data.storeLocations.listStoreLocations).toEqual({
        data: [storeLocation0],
        meta: {
          before: storeLocation0.id,
          after: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_STORE_LOCATIONS,
      variables: {
        limit: 2,
        before: storeLocation0.id
      }
    }).then((response: any) =>
      expect(response.data.storeLocations.listStoreLocations).toEqual({
        data: [storeLocation2, storeLocation1],
        meta: {
          after: storeLocation1.id,
          before: null,
          limit: 2
        }
      })
    );
  });

  test('should be able to use cursor-based pagination (ascending)', async () => {
    const [storeLocation0, storeLocation1, storeLocation2] = testStoreLocations;

    await query({
      query: LIST_STORE_LOCATIONS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC'
      }
    }).then((response: any) =>
      expect(response.data.storeLocations.listStoreLocations).toEqual({
        data: [storeLocation0, storeLocation1],
        meta: {
          after: storeLocation1.id,
          before: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_STORE_LOCATIONS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC',
        after: storeLocation1.id
      }
    }).then((response: any) =>
      expect(response.data.storeLocations.listStoreLocations).toEqual({
        data: [storeLocation2],
        meta: {
          before: storeLocation2.id,
          after: null,
          limit: 2
        }
      })
    );

    await query({
      query: LIST_STORE_LOCATIONS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC',
        before: storeLocation2.id
      }
    }).then((response: any) =>
      expect(response.data.storeLocations.listStoreLocations).toEqual({
        data: [storeLocation0, storeLocation1],
        meta: {
          after: storeLocation1.id,
          before: null,
          limit: 2
        }
      })
    );
  });
});
