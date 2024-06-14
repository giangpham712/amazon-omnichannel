import { tagResources } from '@webiny/cli-plugin-deploy-pulumi/utils';

export = async () => {
  // Add tags to all resources that support tagging. Read more about the default environment variables:
  // https://www.webiny.com/docs/how-to-guides/environment-variables#webiny-environment-variables
  tagResources({
    WbyProjectName: String(process.env.WEBINY_PROJECT_NAME),
    WbyEnvironment: String(process.env.WEBINY_ENV)
  });

  // Import "dev" resources config and initialize resources.
  return await import('./default').then(module => module.default());
};
