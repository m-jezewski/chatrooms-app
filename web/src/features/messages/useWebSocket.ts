import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  connectionOpened,
  connectionClosed,
  connectionError,
  openedChannel,
  receivedMessage,
  setMessages,
} from './messagesSlice.ts';
import { Message } from '../../interfaces.ts';
import { RootState } from '../../store.ts';
import io, { Socket } from 'socket.io-client';

const useWebSocket = (channelId: string | undefined) => {
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);
  const isConnected = useSelector((state: RootState) => state.messages.isConnected);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_WS_URL, {
      withCredentials: true,
      secure: true,
      port: 3001,
    });
    const socket = socketRef.current;

    const onConnect = () => {
      dispatch(connectionOpened());
    };

    const onDisconnect = () => {
      dispatch(connectionClosed());
    };

    const onConnectError = (error: Error) => {
      dispatch(connectionError(error.message || 'Cannot reach the chat server'));
    };

    const onServerError = ({ message }: { message?: string }) => {
      toast.error(message ?? 'The chat server rejected that action.');
    };

    const onNewMessage = (message: Message) => {
      dispatch(receivedMessage(message));
    };

    const onJoinedChannel = (data: { messages: Message[]; channelId: string }) => {
      dispatch(setMessages({ channelId: data.channelId, messages: data.messages }));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('error', onServerError);
    socket.on('newMessage', onNewMessage);
    socket.on('joinedChannel', onJoinedChannel);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('error', onServerError);
      socket.off('newMessage', onNewMessage);
      socket.off('joinedChannel', onJoinedChannel);
      socket.disconnect();
      socketRef.current = null;
      dispatch(connectionClosed());
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(openedChannel(channelId ?? null));
  }, [channelId, dispatch]);

  useEffect(() => {
    if (!channelId || !isConnected) return;

    socketRef.current?.emit('joinChannel', { channelId });

    return () => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('leaveChannel', { channelId });
      }
    };
  }, [channelId, isConnected]);

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
