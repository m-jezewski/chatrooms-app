import React, { useSyncExternalStore } from 'react';
import { Link, useParams } from 'react-router';
import { getRecentRooms, subscribeToRecentRooms } from '../../utils/recentRooms.ts';
import styles from './RecentRoomsList.module.scss';

export const RecentRoomsList = () => {
  const { roomId } = useParams();
  const rooms = useSyncExternalStore(subscribeToRecentRooms, getRecentRooms);

  if (rooms.length === 0) {
    return <p className={styles.empty}>No recent rooms yet.</p>;
  }

  return (
    <div className={styles.list}>
      {rooms.map((room) => (
        <Link to={`/chatrooms/${room.roomId}`} key={room.roomId}>
          <div className={[styles.item, room.roomId === roomId ? styles.active : ''].join(' ')}># {room.name}</div>
        </Link>
      ))}
    </div>
  );
};
