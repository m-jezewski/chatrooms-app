import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
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
          className="max-w-lg space-y-4 py-11 px-12 bg-modal shadow-sm rounded-lg backdrop-blur-2xl">
          <DialogTitle className="font-medium text-2xl mb-5 text-left text-gray-300">{title}</DialogTitle>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
};
