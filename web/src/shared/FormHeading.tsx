import React from 'react';
import styles from './FormHeading.module.scss';

export const FormHeading = (
  {
    children,
    as: Tag = 'h2',
  }: {
    children: React.ReactNode;
    as?: 'h1' | 'h2' | 'h3';
  }) => {
  return (
    <Tag className={styles.heading}>
      {children}
    </Tag>
  );
};