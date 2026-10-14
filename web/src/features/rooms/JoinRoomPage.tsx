import React, { useState } from 'react';
import { useParams } from 'react-router';
import { FormHeading } from '../../shared/FormHeading.tsx';
import { JoinRoomForm } from './JoinRoomForm.tsx';
import { RoomEntry } from '../../interfaces.ts';
import styles from './JoinRoomPage.module.scss';

export const JoinRoomPage = () => {
  const { inviteCode } = useParams();
  const [locator, setLocator] = useState<RoomEntry | null>(null);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <FormHeading as="h1">{locator ? `# ${locator.name}` : 'Join a room'}</FormHeading>
        <JoinRoomForm inviteCode={inviteCode} onRoomResolved={setLocator} />
      </div>
    </div>
  );
};
