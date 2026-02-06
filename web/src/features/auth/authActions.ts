import {createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from "../../utils/httpRequest.ts";
import {RootState} from "../../store.ts";

export const loginAction = createAsyncThunk(
    'auth/login',
    async (loginData: { email: string; password: string }, {dispatch, rejectWithValue}) => {
        try {
            return await apiRequest({
                endpoint: '/auth/login',
                method: 'POST',
                body: loginData,
                dispatch: dispatch
            });

        } catch (error) {
            let message = 'Unknown Error'
            if (error instanceof Error) message = error.message
            return rejectWithValue(message);
        }
    }
);

export const registerAction = createAsyncThunk(
    'auth/register',
    async (registerData: { email: string; password: string; name: string }, {dispatch, rejectWithValue}) => {
        try {
            return await apiRequest({
                endpoint: '/auth/register',
                method: 'POST',
                body: registerData,
                dispatch: dispatch
            });
        } catch (error: any) {
            let message = 'Unknown Error'
            if (error instanceof Error) message = error.message
            return rejectWithValue(message);
        }
    }
);

export const statusAction = createAsyncThunk(
    'auth/status',
    async (_, {dispatch, rejectWithValue}) => {
        try {
            return await apiRequest({
                endpoint: '/auth/status',
                method: 'GET',
                dispatch: dispatch,
            });
        } catch (error) {
            let message = 'Unknown Error'
            if (error instanceof Error) message = error.message
            return rejectWithValue(message);
        }
    }
)

export const logoutAction = createAsyncThunk(
    'auth/logout',
    async (_, {getState, dispatch, rejectWithValue}) => {
        const { auth } = getState() as RootState

        if(!auth.user ){
            return rejectWithValue("User is already logged out")
        }

        try {
            return await apiRequest({
                endpoint: '/auth/logout',
                method: 'DELETE',
                dispatch: dispatch,
            });
        } catch (error) {
            let message = 'Unknown Error'
            if (error instanceof Error) message = error.message
            return rejectWithValue(message);
        }
    }
)
