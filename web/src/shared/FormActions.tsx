import { ReactNode } from 'react';
import { cx } from '../utils/cx.ts';
import styles from './FormActions.module.scss';

export const FormActions = ({
  children,
  className = '',
  equalWidth = false,
}: {
  children: ReactNode;
  className?: string;
  equalWidth?: boolean;
}) => {
  return <div className={cx(styles.actions, equalWidth && styles.equalWidth, className)}>{children}</div>;
};
