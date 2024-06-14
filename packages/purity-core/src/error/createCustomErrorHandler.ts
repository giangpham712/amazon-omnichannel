import { getWebinyVersionHeaders } from '@webiny/utils';
import { HandlerErrorPlugin } from '@webiny/handler';
import { HttpContext } from '@webiny/handler-http/types';

const DEFAULT_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  ...getWebinyVersionHeaders()
};

export default () =>
  new HandlerErrorPlugin<HttpContext>(async (context, error) => {
    if (!context.http || typeof context.http.response !== 'function') {
      return error;
    }

    return context.http.response({
      statusCode: 500,
      body: JSON.stringify({
        error: {
          name: 'Error',
          message: 'Internal Server Error'
        }
      }),
      headers: DEFAULT_HEADERS
    });
  });
