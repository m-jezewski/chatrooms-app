import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { AppButton } from './AppButton.tsx';
import React from 'react';

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
    <Dialog open={isOpen} onClose={() => onClose()} className="relative z-50">
      <div className="fixed inset-0 w-screen flex items-center justify-center bg-black/10 backdrop-blur-sm">
        <DialogPanel
          className="max-w-lg space-y-4 p-12 bg-violet-900/10 shadow-sm rounded-lg backdrop-blur-2xl ">
          <div className={'flex justify-between items-center mb-6'}>
            <DialogTitle className="text-2xl">{title}</DialogTitle>
            <AppButton
              className={'h-min p-2'}
              variant={'transparent'}
              rounded={true} onClick={() => onClose()}>
              <svg className={'aspect-1/1'} xmlns="http://www.w3.org/2000/svg"
                   height="20px" viewBox="0 -960 960 960"
                   width="20px" fill="#e8eaed">
                <path
                  d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
              </svg>
            </AppButton>
          </div>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
};
