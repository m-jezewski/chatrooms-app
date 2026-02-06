import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {User} from "../../interfaces.ts";
import {loginAction, logoutAction, registerAction, statusAction} from "./authActions.ts";

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.error = null;
            state.isLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(logoutAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(logoutAction.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                state.user = null;
                state.error = null;
            })
            .addCase(logoutAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(statusAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(statusAction.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(statusAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(loginAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginAction.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(loginAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(registerAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerAction.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(registerAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
    selectors: {
        selectAuthState: state => state,
        selectLoggedUser: state => state.user,
        selectIsAuthActionLoading: state => state.isLoading,
        selectAuthActionError: state => state.error,
    }
});

export const {
    selectLoggedUser,
    selectAuthState
} = authSlice.selectors;

export const {logout} = authSlice.actions;

export default authSlice.reducer;