import React from 'react';
import { useNavigate } from 'react-router';
import { FormHeading } from '../../shared/FormHeading.tsx';
import { LoginForm } from './LoginForm.tsx';
import styles from './Login.module.scss';

// Entry-layout host for signing in. Inside the app shell the same form opens in AuthModal.
export const Login = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <FormHeading as="h1">Sign in</FormHeading>
      <LoginForm
        onSuccess={() => navigate('/chatrooms')}
        onSwitchToRegister={() => navigate('/register')}
      />
    </div>
  );
};
