import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message, OutgoingMessage } from '../../interfaces.ts';

interface MessagesState {
  channelId: string | null;
  messages: Message[];
  hasMore: boolean;
  isConnected: boolean;
  onlineCount: number;
  error: string | null;
}

const initialState: MessagesState = {
  channelId: null,
  messages: [],
  hasMore: true,
  isConnected: false,
  onlineCount: 0,
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
      state.onlineCount = 0;
    },
    channelOpened(state, action: PayloadAction<string | null>) {
      state.channelId = action.payload;
      state.messages = [];
      state.hasMore = true;
      state.onlineCount = 0;
    },
    presenceChanged(state, action: PayloadAction<{ channelId: string; count: number }>) {
      if (action.payload.channelId !== state.channelId) return;

      state.onlineCount = action.payload.count;
    },
    historyLoaded(state, action: PayloadAction<{ channelId: string; messages: Message[]; hasMore: boolean }>) {
      if (action.payload.channelId !== state.channelId) return;

      state.messages = action.payload.messages;
      state.hasMore = action.payload.hasMore;
    },
    olderMessagesLoaded(state, action: PayloadAction<{ channelId: string; messages: Message[]; hasMore: boolean }>) {
      if (action.payload.channelId !== state.channelId) return;

      state.messages = [...action.payload.messages, ...state.messages];
      state.hasMore = action.payload.hasMore;
    },
    messageReceived(state, action: PayloadAction<Message>) {
      if (action.payload.textChannelId !== state.channelId) return;

      state.messages.push(action.payload);
    },
    connectionFailed(state, action: PayloadAction<string>) {
      state.isConnected = false;
      state.onlineCount = 0;
      state.error = action.payload;
    },
  },
});

export const messageSubmitted = createAction<OutgoingMessage>('messages/messageSubmitted');

export const {
  connectionOpened,
  connectionClosed,
  channelOpened,
  presenceChanged,
  messageReceived,
  connectionFailed,
  historyLoaded,
  olderMessagesLoaded,
} = messagesSlice.actions;

export default messagesSlice.reducer;
