import { Form } from 'formik';
import React from 'react';

export const FormContainer = (
  {
    children,
    className = '',
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
  return (
    <Form className={`w-full flex flex-col gap-3 min-w-64 ${className}`}>
      {children}
    </Form>
  );
};
