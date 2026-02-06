import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Chatroom} from "../../interfaces.ts";
import {listChatroomsAction} from "./chatroomsActions.ts";

interface ChatroomsState {
    chatrooms: Chatroom[] | null;
    error: string | null;
}

const initialState: ChatroomsState = {
    chatrooms: [],
    error: null,
};

const chatroomsSlice = createSlice({
    name: 'chatrooms',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(listChatroomsAction.pending, (state) => {
                state.error = null;
            })
            .addCase(listChatroomsAction.fulfilled, (state, action: PayloadAction<any>) => {
                state.chatrooms = action.payload;
                state.error = null;
            })
            .addCase(listChatroomsAction.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
    selectors: {
        selectChatroomsList: state => state.chatrooms,
    }
});

export const {
    selectChatroomsList,
} = chatroomsSlice.selectors;

export default chatroomsSlice.reducer;