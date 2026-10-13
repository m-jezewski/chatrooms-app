import React from 'react';
import { Link, useParams } from 'react-router';
import { useGetSavedRoomsQuery } from '../../services/chatroomsApi.ts';
import styles from './RecentRoomsList.module.scss';

export const SavedRoomsList = () => {
  const { roomId } = useParams();
  const { data: rooms = [] } = useGetSavedRoomsQuery();

  if (rooms.length === 0) {
    return <p className={styles.empty}>No saved rooms yet.</p>;
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
