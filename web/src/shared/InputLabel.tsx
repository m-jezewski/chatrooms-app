import { HTMLProps } from 'react';
import styles from './InputLabel.module.scss';

interface InputLabelProps extends HTMLProps<HTMLLabelElement> {
  children: React.ReactNode;
}

export const InputLabel = ({ children, ...otherProps }: InputLabelProps) => {
  return (
    <label {...otherProps} className={styles.label}>
      {children}
    </label>
  );
};
