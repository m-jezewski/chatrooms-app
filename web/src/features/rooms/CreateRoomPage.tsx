import React, { useState } from 'react';
import { FormHeading } from '../../shared/FormHeading.tsx';
import { CreateRoomForm } from './CreateRoomForm.tsx';
import styles from './CreateRoomPage.module.scss';

// Entry-layout host for the create flow — reachable from the welcome screen only.
// Inside the app shell the same form opens in CreateRoomModal instead.
export const CreateRoomPage = () => {
  const [created, setCreated] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <FormHeading as="h1">{created ? 'Room created' : 'Create a room'}</FormHeading>
        <CreateRoomForm onCreated={() => setCreated(true)} />
      </div>
    </div>
  );
};
