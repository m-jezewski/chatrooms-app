import React, { useSyncExternalStore } from 'react';
import { Link, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { selectLoggedUser } from '../auth/authSlice.ts';
import { useGetSavedRoomsQuery } from '../../services/chatroomsApi.ts';
import { getRecentRooms, subscribeToRecentRooms } from '../../utils/recentRooms.ts';
import { cx } from '../../utils/cx.ts';
import styles from './RoomList.module.scss';

export const RoomList = () => {
  const { roomId } = useParams();
  const loggedUser = useSelector(selectLoggedUser);
  const recentRooms = useSyncExternalStore(subscribeToRecentRooms, getRecentRooms);
  const { data: savedRooms = [] } = useGetSavedRoomsQuery(undefined, { skip: !loggedUser });

  const section = loggedUser
    ? { label: 'Your rooms', rooms: savedRooms, emptyMessage: 'No saved rooms yet.' }
    : { label: 'Recent', rooms: recentRooms, emptyMessage: 'No recent rooms yet.' };

  return (
    <>
      <span className={styles.sectionLabel}>{section.label}</span>
      {section.rooms.length === 0 ? (
        <p className={styles.empty}>{section.emptyMessage}</p>
      ) : (
        <div className={styles.list}>
          {section.rooms.map((room) => (
            <Link to={`/chatrooms/${room.roomId}`} key={room.roomId}>
              <div className={cx(styles.item, room.roomId === roomId && styles.active)}># {room.name}</div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};
