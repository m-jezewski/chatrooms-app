import toast from 'react-hot-toast';
import io, { Socket } from 'socket.io-client';
import {
  connectionOpened,
  connectionClosed,
  connectionError,
  messageSubmitted,
  openedChannel,
  receivedMessage,
  setMessages,
} from './messagesSlice.ts';
import { joinedRoom, membershipRefused } from '../chatrooms/roomMembershipSlice.ts';
import { api } from '../../services/api.ts';
import { Message } from '../../interfaces.ts';
import type { AppStartListening } from '../../listenerMiddleware.ts';

let roomSocket: Socket | null = null;

export const addRoomSocketListeners = (startListening: AppStartListening) => {
  startListening({
    actionCreator: joinedRoom,
    effect: async (action, listenerApi) => {
      listenerApi.cancelActiveListeners();

      const channelId = action.payload;
      listenerApi.dispatch(openedChannel(channelId));

      const socket = io(import.meta.env.VITE_WS_URL, { withCredentials: true });
      roomSocket = socket;

      socket.on('connect', () => {
        listenerApi.dispatch(connectionOpened());
        socket.emit('joinChannel', { channelId });
      });

      socket.on('disconnect', () => {
        listenerApi.dispatch(connectionClosed());
      });

      socket.on('connect_error', (error: Error) => {
        listenerApi.dispatch(connectionError(error.message || 'Cannot reach the chat server'));
      });

      socket.on('error', ({ message, code }: { message?: string; code?: string }) => {
        if (code === 'NOT_IN_CHANNEL') {
          listenerApi.dispatch(membershipRefused());
          return;
        }

        toast.error(message ?? 'The chat server rejected that action.');
      });

      socket.on('newMessage', (message: Message) => {
        listenerApi.dispatch(receivedMessage(message));
      });

      socket.on('roomExpired', () => {
        listenerApi.dispatch(api.util.invalidateTags([{ type: 'Chatroom', id: channelId }]));
      });

      socket.on('joinedChannel', (data: { messages: Message[]; hasMore: boolean; channelId: string }) => {
        listenerApi.dispatch(
          setMessages({ channelId: data.channelId, messages: data.messages, hasMore: data.hasMore }),
        );
      });

      try {
        await listenerApi.condition((_, state) => state.roomMembership.joinedChannelId !== channelId);
      } finally {
        if (socket.connected) {
          socket.emit('leaveChannel', { channelId });
        }

        socket.removeAllListeners();
        socket.disconnect();

        if (roomSocket === socket) {
          roomSocket = null;
        }

        listenerApi.dispatch(connectionClosed());
      }
    },
  });

  startListening({
    actionCreator: messageSubmitted,
    effect: (action) => {
      roomSocket?.emit('sendMessage', action.payload);
    },
  });

  startListening({
    actionCreator: membershipRefused,
    effect: (_, listenerApi) => {
      if (listenerApi.getState().roomMembership.lostAccessTo) {
        toast.error('Lost access to this room — reload the page to get back in.');
      }
    },
  });
};
