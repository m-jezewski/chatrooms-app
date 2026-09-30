import React, { useState } from 'react';
import { AppModal } from '../../shared/AppModal.tsx';
import { LoginForm } from './LoginForm.tsx';
import { RegisterForm } from './RegisterForm.tsx';

interface AuthModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

export const AuthModal = ({ isOpen, closeModal }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <AppModal title={mode === 'login' ? 'Sign in' : 'Register'} isOpen={isOpen} onClose={closeModal}>
      {mode === 'login' ? (
        <LoginForm onSuccess={closeModal} onSwitchToRegister={() => setMode('register')} />
      ) : (
        <RegisterForm onSuccess={closeModal} onSwitchToLogin={() => setMode('login')} />
      )}
    </AppModal>
  );
};
