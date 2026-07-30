import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import React from 'react';
import styles from './AppModal.module.scss';

export const AppModal = (
  {
    children,
    isOpen,
    onClose,
    title,
  }: {
    title: React.ReactNode;
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
  }) => {

  return (
    <Dialog open={isOpen} onClose={() => onClose()} className={styles.dialog}>
      <div className={styles.overlay}>
        <DialogPanel className={styles.panel}>
          <DialogTitle className={styles.title}>{title}</DialogTitle>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
};