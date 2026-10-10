import React, { useState } from 'react';
import { FormHeading } from '../../shared/FormHeading.tsx';
import { CreateRoomForm } from './CreateRoomForm.tsx';
import styles from './CreateRoomPage.module.scss';

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
