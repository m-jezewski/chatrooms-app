import React from 'react';
import styles from './FormActions.module.scss';

export const FormActions = ({
  children,
  className = '',
  equalWidth = false,
}: {
  children: React.ReactNode;
  className?: string;
  equalWidth?: boolean;
}) => {
  return <div className={[styles.actions, equalWidth ? styles.equalWidth : '', className].join(' ')}>{children}</div>;
};
