import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import React, { cloneElement, MouseEvent, MouseEventHandler, ReactElement, ReactNode, useState } from 'react';
import styles from './AppModal.module.scss';

export type TriggerElement = ReactElement<{ onClick?: MouseEventHandler<HTMLElement> }>;

type AppModalProps = {
  title: ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
} & (
  | { trigger: TriggerElement; defaultOpen?: boolean; onClose?: () => void; isOpen?: never } // Uncontrolled
  | { trigger?: never; defaultOpen?: never; onClose: () => void; isOpen: boolean; } // Controlled
);

export const AppModal = (props: AppModalProps) => {
  const { title, children, trigger } = props;
  const [selfOpen, setSelfOpen] = useState(!!props.defaultOpen);

  const isOpen = props.isOpen ?? selfOpen;

  const close = () => {
    props.onClose?.();
    setSelfOpen(false);
  };

  return (
    <>
      {trigger && cloneElement(trigger, {
        onClick: (event: MouseEvent<HTMLElement>) => {
          trigger.props.onClick?.(event);
          setSelfOpen(true);
        },
      })}

      <Dialog open={isOpen} onClose={close} className={styles.dialog}>
        <div className={styles.overlay}>
          <DialogPanel className={styles.panel}>
            <DialogTitle className={styles.title}>{title}</DialogTitle>
            {typeof children === 'function' ? children(close) : children}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};
