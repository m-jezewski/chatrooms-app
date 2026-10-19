import { useEffect, useState } from 'react';
import { AppButton } from '../../shared/AppButton.tsx';
import { getRecentRooms, removeRecentRoom } from '../../utils/recentRooms.ts';
import styles from './RoomUnavailable.module.scss';

interface RoomUnavailableProps {
  roomId: string;
  notFound: boolean;
  onRetry: () => void;
}

export const RoomUnavailable = ({ roomId, notFound, onRetry }: RoomUnavailableProps) => {
  const [knownName] = useState(() => getRecentRooms().find((room) => room.roomId === roomId)?.name);

  useEffect(() => {
    if (notFound) {
      removeRecentRoom(roomId);
    }
  }, [notFound, roomId]);

  if (!notFound) {
    return (
      <div className={styles.screen}>
        <div className={styles.card}>
          <h1 className={styles.title}>Could not open this room</h1>
          <p className={styles.text}>The server did not answer. Check your connection and try again.</p>
          <div className={styles.actions}>
            <AppButton variant={'purple'} onClick={onRetry}>
              Try again
            </AppButton>
            <AppButton as={'link'} to={'/'} variant={'transparent'}>
              Back to start
            </AppButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <h1 className={styles.title}>{knownName ? `#${knownName} is gone` : 'No such room'}</h1>
        <p className={styles.text}>
          {knownName
            ? 'This room expired or was deleted, and its messages went with it. We removed it from your recent rooms.'
            : 'This link does not lead to a room. It may have expired, been deleted, or never existed.'}
        </p>
        <div className={styles.actions}>
          <AppButton as={'link'} to={'/'} variant={'purple'}>
            Back to start
          </AppButton>
        </div>
      </div>
    </div>
  );
};
