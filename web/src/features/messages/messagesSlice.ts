import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message } from '../../interfaces.ts';

interface MessagesState {
    messages: Message[];
    isConnected: boolean;
    error: string | null;
}

const initialState: MessagesState = {
    messages: [],
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
        setMessages(state, action: PayloadAction<Message[]>) {
            state.messages = action.payload;
        },
        receivedMessage(state, action: PayloadAction<Message>) {
            state.messages.push(action.payload);
        },
        connectionError(state, action: PayloadAction<string>) {
            state.error = action.payload;
        },
    },
});

export const { connectionOpened, connectionClosed, receivedMessage, connectionError, setMessages } =
    messagesSlice.actions;

export default messagesSlice.reducer;
