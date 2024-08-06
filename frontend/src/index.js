import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from './authProvider';
import App from './App';

const pca = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <MsalProvider instance={pca}>
    <App />
  </MsalProvider>
);