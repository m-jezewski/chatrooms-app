import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message } from '../../interfaces.ts';

interface MessagesState {
  channelId: string | null;
  messages: Message[];
  hasMore: boolean;
  isConnected: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  channelId: null,
  messages: [],
  hasMore: true,
  isConnected: false,
  error: null,
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    connectionOpened(state) {
      state.isConnected = true;
      state.error = null;
    },
    connectionClosed(state) {
      state.isConnected = false;
    },
    openedChannel(state, action: PayloadAction<string | null>) {
      state.channelId = action.payload;
      state.messages = [];
      state.hasMore = true;
    },
    setMessages(state, action: PayloadAction<{ channelId: string; messages: Message[] }>) {
      if (action.payload.channelId !== state.channelId) return;

      state.messages = action.payload.messages;
      state.hasMore = true;
    },
    prependMessages(state, action: PayloadAction<{ channelId: string; messages: Message[]; hasMore: boolean }>) {
      if (action.payload.channelId !== state.channelId) return;

      state.messages = [...action.payload.messages, ...state.messages];
      state.hasMore = action.payload.hasMore;
    },
    receivedMessage(state, action: PayloadAction<Message>) {
      if (action.payload.textChannelId !== state.channelId) return;

      state.messages.push(action.payload);
    },
    connectionError(state, action: PayloadAction<string>) {
      state.isConnected = false;
      state.error = action.payload;
    },
  },
});

export const {
  connectionOpened,
  connectionClosed,
  openedChannel,
  receivedMessage,
  connectionError,
  setMessages,
  prependMessages,
} = messagesSlice.actions;

export default messagesSlice.reducer;
