import React from 'react';
import { useNavigate } from 'react-router';
import { FormHeading } from '../../shared/FormHeading.tsx';
import { RegisterForm } from './RegisterForm.tsx';
import styles from './Register.module.scss';

export const Register = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <FormHeading as="h1">Register</FormHeading>
      <RegisterForm
        onSuccess={() => navigate('/chatrooms')}
        onSwitchToLogin={() => navigate('/login')}
      />
    </div>
  );
};
