import { configureStore } from '@reduxjs/toolkit';
import authSlice from './features/auth/authSlice.ts';
import messagesSlice from './features/messages/messagesSlice.ts';
import roomMembershipSlice from './features/chatrooms/roomMembershipSlice.ts';
import { addRoomSocketListeners } from './features/messages/roomSocketListeners.ts';
import { listenerMiddleware, startAppListening } from './listenerMiddleware.ts';
import { api } from './services/api.ts';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    messages: messagesSlice,
    roomMembership: roomMembershipSlice,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware).concat(api.middleware),
});

addRoomSocketListeners(startAppListening);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
