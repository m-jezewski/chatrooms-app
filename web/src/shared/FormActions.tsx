import React from 'react';
import { cx } from '../utils/cx.ts';
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
  return <div className={cx(styles.actions, equalWidth && styles.equalWidth, className)}>{children}</div>;
};
