import React from 'react';
import { AppModal } from '../../shared/AppModal.tsx';
import { EditRoomTtlForm } from './EditRoomTtlForm.tsx';
import { Chatroom } from '../../interfaces.ts';

interface EditRoomTtlFormModalProps {
  isOpen: boolean;
  closeModal: () => void;
  room: Chatroom;
}

export const EditRoomTtlFormModal = ({ isOpen, closeModal, room }: EditRoomTtlFormModalProps) => {
  return (
    <AppModal title={'Change expiry'} isOpen={isOpen} onClose={closeModal}>
      <EditRoomTtlForm room={room} closeModal={closeModal} />
    </AppModal>
  );
};
