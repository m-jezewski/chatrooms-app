import { Form } from 'formik';
import React from 'react';
import styles from './FormContainer.module.scss';

export const FormContainer = (
  {
    children,
    className = '',
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
  return (
    <Form className={[styles.container, className].join(' ')}>
      {children}
    </Form>
  );
};