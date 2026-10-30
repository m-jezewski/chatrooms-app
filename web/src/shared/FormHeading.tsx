import { ReactNode } from 'react';
import styles from './FormHeading.module.scss';

export const FormHeading = ({ children, as: Tag = 'h2' }: { children: ReactNode; as?: 'h1' | 'h2' | 'h3' }) => {
  return <Tag className={styles.heading}>{children}</Tag>;
};
