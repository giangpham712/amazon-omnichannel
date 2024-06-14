import { Context } from '~/types';
import { createSellingPartner, SellingPartner } from '@purity/selling-partner';

export default class OrderReturnsResolver {
  protected readonly context: Context;
  protected sellingPartner: SellingPartner;
  protected sellingPartnerSandbox: SellingPartner;

  constructor(context: Context) {
    this.context = context;
    this.sellingPartner = createSellingPartner({
      useSandbox: false,
      credentials: {
        SELLING_PARTNER_APP_CLIENT_ID: process.env.SELLING_PARTNER_APP_CLIENT_ID || '',
        SELLING_PARTNER_APP_CLIENT_SECRET: process.env.SELLING_PARTNER_APP_CLIENT_SECRET || '',
        AWS_ACCESS_KEY_ID: process.env.SELLING_PARTNER_AWS_ACCESS_KEY_ID || '',
        AWS_SECRET_ACCESS_KEY: process.env.SELLING_PARTNER_AWS_SECRET_ACCESS_KEY || '',

        AWS_SELLING_PARTNER_ROLE: process.env.AWS_SELLING_PARTNER_ROLE || ''
      },
      refreshToken: process.env.AMZ_API_REFRESH_TOKEN || ''
    });

    this.sellingPartnerSandbox = createSellingPartner({
      useSandbox: true,
      credentials: {
        SELLING_PARTNER_APP_CLIENT_ID: process.env.SELLING_PARTNER_APP_CLIENT_ID || '',
        SELLING_PARTNER_APP_CLIENT_SECRET: process.env.SELLING_PARTNER_APP_CLIENT_SECRET || '',
        AWS_ACCESS_KEY_ID: process.env.SELLING_PARTNER_AWS_ACCESS_KEY_ID || '',
        AWS_SECRET_ACCESS_KEY: process.env.SELLING_PARTNER_AWS_SECRET_ACCESS_KEY || '',

        AWS_SELLING_PARTNER_ROLE: process.env.AWS_SELLING_PARTNER_ROLE || ''
      },
      refreshToken: process.env.AMZ_API_REFRESH_TOKEN || ''
    });
  }

  /**
   * Generates primary key (PK), to be used upon mutating / querying DynamoDB data.
   * @param base
   */
  getPK(base = 'OrderReturn') {
    // If our GraphQL API uses the Webiny I18N application, we can use
    // the current locale code as the prefix for our primary keys (PKs).
    // https://github.com/webiny/webiny-js/tree/v5.12.0/packages/api-i18n
    base = `L#${base}`;

    // In integration test environments, we use the `process.env.TEST_RUN_ID` as a suffix.
    // This helps us isolate the created test data and perform assertions in our tests.
    if (process.env.TEST_RUN_ID) {
      base += '_TEST_RUN_' + process.env.TEST_RUN_ID;
    }

    return base;
  }
}
