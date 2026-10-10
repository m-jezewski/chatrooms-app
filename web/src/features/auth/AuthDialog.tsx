import React, { useState } from 'react';
import { AppModal, TriggerElement } from '../../shared/AppModal.tsx';
import { LoginForm } from './LoginForm.tsx';
import { RegisterForm } from './RegisterForm.tsx';

interface AuthDialogProps {
  trigger: TriggerElement;
}

export const AuthDialog = ({ trigger }: AuthDialogProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <AppModal
      title={mode === 'login' ? 'Sign in' : 'Register'}
      trigger={trigger}
      onClose={() => setMode('login')}
    >
      {(close) => (mode === 'login' ? (
        <LoginForm onSuccess={close} onSwitchToRegister={() => setMode('register')} />
      ) : (
        <RegisterForm onSuccess={close} onSwitchToLogin={() => setMode('login')} />
      ))}
    </AppModal>
  );
};
