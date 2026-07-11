import { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  connectionOpened,
  connectionClosed,
  receivedMessage,
  setMessages,
} from './messagesSlice.ts';
import {Message} from "../../interfaces.ts";
import io, { Socket } from 'socket.io-client';

const useWebSocket = (channelId: string | undefined) => {
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_WS_URL, {
      withCredentials: true,
      secure: true,
      port: 3001,
    });
    const socket = socketRef.current;

    const onNewMessage = (message: Message) => {
      dispatch(receivedMessage(message));
    };

    const onJoinedChannel = (data: { messages: Message[] }) => {
      dispatch(setMessages(data.messages));
    };

    const onDisconnect = () => {
      dispatch(connectionClosed());
    };

    socket.on('newMessage', onNewMessage);
    socket.on('joinedChannel', onJoinedChannel);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('newMessage', onNewMessage);
      socket.off('joinedChannel', onJoinedChannel);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!channelId) return;

    socketRef.current?.emit('joinChannel', { channelId });
    dispatch(connectionOpened());

    return () => {
      socketRef.current?.emit('leaveChannel', { channelId });
      dispatch(connectionClosed());
    };
  }, [channelId]);

  const sendMessage = useCallback(
    ({ channelId, payload, senderId }: { channelId: string; payload: string; senderId: string }) => {
      socketRef.current?.emit('sendMessage', { channelId, payload, senderId });
    },
    [],
  );

  return {
    sendMessage,
  };
};

export default useWebSocket;
