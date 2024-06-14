import { Context } from '~/types';
import { createSellingPartner } from '@purity/selling-partner';
import { createOrdersCrud } from '@purity/core/orders/crud';
import { SellingPartner } from '@purity/selling-partner/types';

export default class OrdersResolver {
  protected readonly context: Context;

  protected sellingPartner: SellingPartner;
  protected ordersCrud;

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

    this.ordersCrud = createOrdersCrud({ elasticsearch: this.context.elasticsearch });
  }
}
