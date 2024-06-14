import { createHandler } from '@webiny/handler-aws';
import { createSellingPartner } from '@purity/selling-partner';
import { createElasticsearchClient } from '@webiny/api-elasticsearch/client';

import handlerPlugin from './handler';
import { createPurityContext } from '@purity/core';
import errorPlugins from '@purity/core/error/plugins';

const sellingPartner = createSellingPartner({
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

const elasticsearch = createElasticsearchClient({
  endpoint: `https://${process.env.ELASTIC_SEARCH_ENDPOINT}`
});

export const handler = createHandler({
  plugins: [
    errorPlugins(),
    createPurityContext({
      elasticsearch
    }),
    handlerPlugin({ sellingPartner, elasticsearch })
  ]
});
