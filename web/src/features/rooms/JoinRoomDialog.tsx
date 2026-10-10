import React, { useState } from 'react';
import { AppModal, TriggerElement } from '../../shared/AppModal.tsx';
import { JoinRoomForm } from './JoinRoomForm.tsx';

interface JoinRoomDialogProps {
  trigger: TriggerElement;
  defaultOpen?: boolean;
  inviteCode?: string;
}

export const JoinRoomDialog = ({ trigger, defaultOpen, inviteCode }: JoinRoomDialogProps) => {
  const [roomName, setRoomName] = useState<string | null>(null);

  return (
    <AppModal
      title={roomName ? `# ${roomName}` : 'Join a room'}
      trigger={trigger}
      defaultOpen={defaultOpen}
      onClose={() => setRoomName(null)}
    >
      {(close) => (
        <JoinRoomForm
          inviteCode={inviteCode}
          onRoomResolved={(room) => setRoomName(room.name)}
          onJoined={close}
          onCancel={close}
        />
      )}
    </AppModal>
  );
};
