import { HttpContext } from '@webiny/handler-http/types';
import { ArgsContext } from '@webiny/handler-args/types';

export interface Context extends HttpContext, ArgsContext {}
