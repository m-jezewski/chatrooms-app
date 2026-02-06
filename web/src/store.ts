import {configureStore} from '@reduxjs/toolkit';
import authSlice from "./features/auth/authSlice.ts";
import usersSlice from "./features/users/usersSlice.ts";
import chatroomsSlice from "./features/chatrooms/chatroomsSlice.ts";
import messagesSlice from "./features/messages/messagesSlice.ts";

export const store = configureStore({
    reducer: {
        auth: authSlice,
        users: usersSlice,
        chatrooms: chatroomsSlice,
        messages: messagesSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware(),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;