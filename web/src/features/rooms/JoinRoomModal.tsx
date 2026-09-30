import React, { useState } from 'react';
import { AppModal } from '../../shared/AppModal.tsx';
import { JoinRoomForm } from './JoinRoomForm.tsx';
import { RoomLocator } from '../../interfaces.ts';

interface JoinRoomModalProps {
  isOpen: boolean;
  closeModal: () => void;
  inviteCode?: string;
}

export const JoinRoomModal = ({ isOpen, closeModal, inviteCode }: JoinRoomModalProps) => {
  const [locator, setLocator] = useState<RoomLocator | null>(null);

  return (
    <AppModal title={locator ? `# ${locator.name}` : 'Join a room'} isOpen={isOpen} onClose={closeModal}>
      <JoinRoomForm
        inviteCode={inviteCode}
        onRoomResolved={setLocator}
        onJoined={closeModal}
        onCancel={closeModal}
      />
    </AppModal>
  );
};
