import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {User} from "../../interfaces.ts";

interface AuthState {
    user: User | null;
}

const initialState: AuthState = {
    user: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        clearUser: (state) => {
            state.user = null;
        },
    },
    selectors: {
        selectAuthState: state => state,
        selectLoggedUser: state => state.user,
    }
});

export const {
    selectLoggedUser,
    selectAuthState
} = authSlice.selectors;

export const {logout, setUser, clearUser} = authSlice.actions;

export default authSlice.reducer;
