import { ContextPlugin } from '@webiny/handler/plugins/ContextPlugin';
import { PurityContext } from '../types';
import { HandlerErrorPlugin } from '@webiny/handler';
import createCustomErrorHandler from './createCustomErrorHandler';

export default () => [
  new ContextPlugin<PurityContext>(async context => {
    const errorHandlerPlugin = context.plugins.oneByType<HandlerErrorPlugin>(HandlerErrorPlugin.type);
    context.plugins.unregister(errorHandlerPlugin.name);
    context.plugins.register(createCustomErrorHandler());
  })
];
