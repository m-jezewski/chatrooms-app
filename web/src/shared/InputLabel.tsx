import { HTMLProps, ReactNode } from 'react';
import { cx } from '../utils/cx.ts';
import styles from './InputLabel.module.scss';

interface InputLabelProps extends HTMLProps<HTMLLabelElement> {
  children: ReactNode;
}

export const InputLabel = ({ children, className, ...otherProps }: InputLabelProps) => {
  return (
    <label {...otherProps} className={cx(styles.label, className)}>
      {children}
    </label>
  );
};
