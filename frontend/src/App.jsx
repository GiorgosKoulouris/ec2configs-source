import React, { Component } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { LoginPage } from './staticComponents/LoginPage';
import { InitSession } from './staticComponents/InitSession';
import { MyConfigs } from './routes/myConfigs/MyConfigs';
import { Admin } from './routes/admin/Admin';

import AWSCreateConfig from './routes/aws/AWSCreateConfig';
import AzCreateConfig from './routes/az/AzCreateConfig';
import { PageNotFound } from './staticComponents/PageNotFound';

const router = createBrowserRouter([
  {
    path: "/login",
    element: <InitSession />
  },
  {
    path: "/",
    element: <MyConfigs />
  },
  {
    path: "/aws",
    element: <AWSCreateConfig data="init" />
  },
  {
    path: "/az",
    element: <AzCreateConfig data="init" />
  },
  {
    path: "/admin",
    element: <Admin />
  },
  {
    path: "*",
    element: <PageNotFound />
  }
]);

export class App extends Component {
  render() {
    return (
      <>
        <AuthenticatedTemplate>
          <RouterProvider router={router} />
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <LoginPage />
        </UnauthenticatedTemplate>
      </>
    )
  }
}

export default App