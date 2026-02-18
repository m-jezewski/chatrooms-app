import {configureStore} from '@reduxjs/toolkit';
import authSlice from "./features/auth/authSlice.ts";
import messagesSlice from "./features/messages/messagesSlice.ts";
import {api} from "./services/api.ts";

export const store = configureStore({
    reducer: {
        auth: authSlice,
        messages: messagesSlice,
        [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
})

export type RootState = ReturnType<typeof store.getState>;
