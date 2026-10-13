import React, { useState } from 'react';
import { AppModal, TriggerElement } from '../../shared/AppModal.tsx';
import { CreateRoomForm } from './CreateRoomForm.tsx';

interface CreateRoomDialogProps {
  trigger: TriggerElement;
  defaultOpen?: boolean;
}

export const CreateRoomDialog = ({ trigger, defaultOpen }: CreateRoomDialogProps) => {
  const [created, setCreated] = useState(false);

  return (
    <AppModal
      title={created ? 'Room created' : 'Create a room'}
      trigger={trigger}
      defaultOpen={defaultOpen}
      onClose={() => setCreated(false)}
    >
      {(close) => <CreateRoomForm onCreated={() => setCreated(true)} onEntered={close} onCancel={close} />}
    </AppModal>
  );
};
