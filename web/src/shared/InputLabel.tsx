import { HTMLProps } from 'react';
import styles from './InputLabel.module.scss';

interface InputLabelProps extends HTMLProps<HTMLLabelElement> {
  children: React.ReactNode;
}

export const InputLabel = ({ children, className, ...otherProps }: InputLabelProps) => {
  return (
    <label {...otherProps} className={[styles.label, className].filter(Boolean).join(' ')}>
      {children}
    </label>
  );
};
