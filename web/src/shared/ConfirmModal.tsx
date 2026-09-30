import React, { ReactNode, useState } from 'react';
import { AppModal } from './AppModal.tsx';
import { AppButton } from './AppButton.tsx';
import { FormActions } from './FormActions.tsx';

interface ConfirmModalProps {
  isOpen: boolean;
  closeModal: () => void;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
}

export const ConfirmModal = (
  {
    isOpen,
    closeModal,
    title,
    children,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
    onConfirm,
  }: ConfirmModalProps,
) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      closeModal();
    } catch {
    }
    setIsConfirming(false);
  };

  return (
    <AppModal title={title} isOpen={isOpen} onClose={closeModal}>
      {children}
      <FormActions equalWidth>
        <AppButton type="button" onClick={closeModal} disabled={isConfirming}>{cancelLabel}</AppButton>
        <AppButton
          type="button"
          variant={danger ? 'red' : 'purple'}
          onClick={handleConfirm}
          disabled={isConfirming}
        >
          {confirmLabel}
        </AppButton>
      </FormActions>
    </AppModal>
  );
};
