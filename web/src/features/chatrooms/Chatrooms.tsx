import { useParams } from 'react-router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { MessageForm } from '../messages/MessageForm.tsx';
import useWebSocket from '../messages/useWebSocket.ts';
import { useGetChatroomByIdQuery, useGetRoomEntryQuery, useJoinChatroomMutation } from '../../services/chatroomsApi.ts';
import { ChatroomTitlePanel } from './ChatroomTitlePanel.tsx';
import { Chatroom } from './Chatroom.tsx';
import { RoomPasswordGate } from './RoomPasswordGate.tsx';
import { useRoomKey } from './RoomKeyContext.tsx';
import { encrypt } from '../../utils/roomCrypto.ts';
import { getNickname, getSenderId } from '../../utils/session.ts';
import { Loader } from '../../shared/Loader.tsx';
import { recordRecentRoom } from '../../utils/recentRooms.ts';
import { RootState } from '../../store.ts';
import styles from './Chatrooms.module.scss';

export const Chatrooms = () => {
  const { roomId: channelId } = useParams();
  const { data: entry } = useGetRoomEntryQuery(channelId!, { skip: !channelId });
  const { data: channelData } = useGetChatroomByIdQuery(channelId!, { skip: !channelId });
  const { secrets, setSecrets } = useRoomKey(channelId);
  const [joinChatroom] = useJoinChatroomMutation();
  const [joinedChannelId, setJoinedChannelId] = useState<string | null>(null);
  const joined = !!channelId && joinedChannelId === channelId;
  const { sendMessage } = useWebSocket(joined ? channelId : undefined);
  const isConnected = useSelector((state: RootState) => state.messages.isConnected);
  const connectionProblem = useSelector((state: RootState) => state.messages.error);

  useEffect(() => {
    if (!channelId || !secrets || joinedChannelId === channelId) return;
    let cancelled = false;

    joinChatroom({ channelId, authKey: secrets.authKey })
      .unwrap()
      .then(() => {
        if (!cancelled) setJoinedChannelId(channelId);
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to join the room.');
      });

    return () => {
      cancelled = true;
    };
  }, [channelId, secrets, joinedChannelId, joinChatroom]);

  useEffect(() => {
    if (joined && entry) {
      recordRecentRoom({ roomId: entry.roomId, name: entry.name });
    }
  }, [joined, entry]);

  const handleSendMessage = async (text: string) => {
    if (!channelId || !secrets) return;
    const payload = await encrypt(secrets.key, JSON.stringify({ nickname: getNickname(), text }));
    sendMessage({ channelId, payload, senderId: getSenderId() });
  };

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
            setJoinedChannelId(channelId);
          }}
        />
      ) : !joined ? (
        <div className={styles.loading}>
          <Loader />
        </div>
      ) : (
        <>
          <Chatroom />
          {!isConnected && <p className={styles.connection}>{connectionProblem ?? 'Connecting to the chat server…'}</p>}
          <MessageForm sendMessage={handleSendMessage} disabled={!isConnected} />
        </>
      )}
    </div>
  );
};
