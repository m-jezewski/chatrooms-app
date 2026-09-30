import React, { useState } from 'react';
import { AppModal } from '../../shared/AppModal.tsx';
import { CreateRoomForm } from './CreateRoomForm.tsx';

interface CreateRoomModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

// Create flow as seen from inside the app shell — no layout switch, the chat stays behind it.
export const CreateRoomModal = ({ isOpen, closeModal }: CreateRoomModalProps) => {
  const [created, setCreated] = useState(false);

  return (
    <AppModal title={created ? 'Room created' : 'Create a room'} isOpen={isOpen} onClose={closeModal}>
      <CreateRoomForm
        onCreated={() => setCreated(true)}
        onEntered={closeModal}
        onCancel={closeModal}
      />
    </AppModal>
  );
};
