import React from 'react';
import { AddLogo } from '@webiny/app-serverless-cms';
import { Cognito } from '@webiny/app-admin-users-cognito';
import { useTags } from '@webiny/app-serverless-cms';
import { Typography } from '@webiny/ui/Typography';
import { Admin } from '@purity/app-serverless-cms';
import './App.scss';
import { AddRoute, Layout } from '@webiny/app-admin';
import { CenteredView } from '@webiny/app-admin';
import Home from './Home';

const environment = process.env.REACT_APP_WEBINY_ENV;

const AppLogo = () => {
  const { location } = useTags();

  return (
    <div>
      {location !== 'navigation' ? (
        <Typography style={{ color: '#fff' }} use="headline6">
          Purity Amazon Omnichannel {environment && environment === 'prod' ? '' : `- ${environment.toUpperCase()}`}
        </Typography>
      ) : (
        <Typography style={{ color: '#000' }} use="subtitle2">
          Purity Amazon Omnichannel
        </Typography>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Admin>
      <Cognito />
      <AddLogo logo={<AppLogo />} />
      <AddRoute path={'/'}>
        <Layout title={'Welcome!'}>
          <CenteredView maxWidth={1300}>
            <Home />
          </CenteredView>
        </Layout>
      </AddRoute>
    </Admin>
  );
};
