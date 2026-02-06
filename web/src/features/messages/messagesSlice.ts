import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MessagesState {
    messages: any[];
    isConnected: boolean;
    error: string | null;
}

const initialState: MessagesState = {
    messages: [],
    isConnected: false,
    error: null,
};

const messagesSlice = createSlice({
    name: 'websocket',
    initialState,
    reducers: {
        connectionOpened(state) {
            state.isConnected = true;
            state.error = null;
        },
        connectionClosed(state) {
            state.isConnected = false;
        },
        setMessages(state, action: PayloadAction<any>) {
            state.messages = action.payload;
        },
        sendMessage(state, action: PayloadAction<any>) {
            // state.messages.push(action.payload);
        },
        receivedMessage(state, action: PayloadAction<any>) {
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
