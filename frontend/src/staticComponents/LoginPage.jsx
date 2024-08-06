import { useMsal } from '@azure/msal-react';
import './loginPage.css';

import logo from '../assets/Skull.png'

export const LoginPage = () => {
  const { instance } = useMsal();
  const initializeSignIn = () => {
    instance.loginRedirect();
  };

  return (
    <div className='login-root'>
      <h1 className='login-title'>EC2 Configs</h1>
      <div className='image-container'>
      <img src={logo} alt='logo' className='login-logo'/>
      </div>
      <button className='action-button login-button' onClick={initializeSignIn}>Sign in</button>
    </div>
  );
};