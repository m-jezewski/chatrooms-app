import { useParams } from 'react-router';
import React from 'react';
import { MessageForm } from '../messages/MessageForm.tsx';
import { ConnectionBanner } from '../messages/ConnectionBanner.tsx';
import { useGetChatroomByIdQuery, useGetRoomEntryQuery } from '../../services/chatroomsApi.ts';
import { ChatroomTitlePanel } from './ChatroomTitlePanel.tsx';
import { Chatroom } from './Chatroom.tsx';
import { RoomPasswordGate } from './RoomPasswordGate.tsx';
import { useRoomKey } from './RoomKeyContext.tsx';
import { useRoomJoin } from './useRoomJoin.ts';
import { Loader } from '../../shared/Loader.tsx';
import styles from './Chatrooms.module.scss';

export const Chatrooms = () => {
  const { roomId: channelId } = useParams();
  const { data: entry } = useGetRoomEntryQuery(channelId!, { skip: !channelId });
  const { data: channelData } = useGetChatroomByIdQuery(channelId!, { skip: !channelId });
  const { secrets, setSecrets } = useRoomKey(channelId);
  const { joined, markJoined } = useRoomJoin({ channelId, secrets, entry });

  if (!channelId) {
    return (
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.welcomeTitle}>No room open</h1>
          <p className={styles.welcomeText}>Pick one from the sidebar, or create and join rooms from there.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ChatroomTitlePanel entry={entry} channelData={channelData} />
      {!secrets ? (
        <RoomPasswordGate
          entry={entry}
          onJoin={(roomSecrets) => {
            setSecrets(roomSecrets);
            markJoined(channelId);
          }}
        />
      ) : !joined ? (
        <div className={styles.loading}>
          <Loader />
        </div>
      ) : (
        <>
          <Chatroom />
          <ConnectionBanner />
          <MessageForm />
        </>
      )}
    </div>
  );
};
