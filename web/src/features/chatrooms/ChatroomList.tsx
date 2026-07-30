import React from 'react';
import { Link, useParams } from 'react-router';
import { useGetChatroomsQuery } from '../../services/chatroomsApi.ts';
import styles from './ChatroomList.module.scss';

export const ChatroomList = () => {
  const { id } = useParams();
  const { data: chatrooms = [] } = useGetChatroomsQuery();

  return (
    <div className={styles.list}>
      {chatrooms.map((chatroom) => (
        <Link to={`chatrooms/${chatroom.id}`} key={chatroom.id}>
          <div className={[styles.item, chatroom.id === id ? styles.active : ''].join(' ')}>
            # {chatroom.name}
          </div>
        </Link>
      ))}
    </div>
  );
};
