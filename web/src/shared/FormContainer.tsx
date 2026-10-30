import { Form } from 'formik';
import React from 'react';
import { cx } from '../utils/cx.ts';
import styles from './FormContainer.module.scss';

export const FormContainer = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return <Form className={cx(styles.container, className)}>{children}</Form>;
};
