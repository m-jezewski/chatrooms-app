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

  if (!socketRef.current) {
    socketRef.current = io('ws://localhost:3001/', {
      withCredentials: true,
      secure: true,
      port: 3001,
    });
  }

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

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

    socketRef.current?.emit('joinChannel', { channelId: Number(channelId) });
    dispatch(connectionOpened());

    return () => {
      socketRef.current?.emit('leaveChannel', { channelId: Number(channelId) });
      dispatch(connectionClosed());
    };
  }, [channelId]);

  const sendMessage = useCallback(({ content, channelId }: { content: string, channelId: number }) => {
    socketRef.current?.emit('sendMessage', { content, channelId });
  }, []);

  return {
    sendMessage,
  };
};

export default useWebSocket;
