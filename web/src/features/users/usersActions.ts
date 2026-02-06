import {createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from "../../utils/httpRequest.ts";

export const createUserAction = createAsyncThunk(
    'users/create',
    async (userData: { name: string; email: string; password: string, role: string }, {dispatch, rejectWithValue}) => {
        try {
            return await apiRequest({
                endpoint: '/users/create',
                method: 'POST',
                body: userData,
                dispatch: dispatch
            });

        } catch (error) {
            let message = 'Unknown Error'
            if (error instanceof Error) message = error.message
            return rejectWithValue(message);
        }
    }
);

export const listUsersAction = createAsyncThunk(
    'users/list',
    async (_, {dispatch, rejectWithValue}) => {
        try {
            return await apiRequest({
                endpoint: '/users/',
                method: 'GET',
                dispatch: dispatch
            });

        } catch (error) {
            let message = 'Unknown Error'
            if (error instanceof Error) message = error.message
            return rejectWithValue(message);
        }
    }
);

export const getUserByIdAction = createAsyncThunk(
    'users/list',
    async ({userId}: { userId: number }, {dispatch, rejectWithValue}) => {
        try {
            return await apiRequest({
                endpoint: `/users/${userId}`,
                method: 'GET',
                dispatch: dispatch
            });

        } catch (error) {
            let message = 'Unknown Error'
            if (error instanceof Error) message = error.message
            return rejectWithValue(message);
        }
    }
);

export const updateUserDataAction = createAsyncThunk(
    'users/list',
    async (
        userData: { id: number, name: string; email: string; role: string }, {
        dispatch,
        rejectWithValue
    }) => {
        try {
            const {id} = userData
            return await apiRequest({
                endpoint: `/users/${id}`,
                method: 'PATCH',
                dispatch: dispatch,
                body: userData,
            });

        } catch (error) {
            let message = 'Unknown Error'
            if (error instanceof Error) message = error.message
            return rejectWithValue(message);
        }
    }
);

export const deleteUserAction = createAsyncThunk(
    'users/delete',
    async ({userId}: { userId: number }, {dispatch, rejectWithValue}) => {
        try {
            return await apiRequest({
                endpoint: `/users/${userId}`,
                method: 'DELETE',
                dispatch: dispatch
            });

        } catch (error) {
            let message = 'Unknown Error'
            if (error instanceof Error) message = error.message
            return rejectWithValue(message);
        }
    }
);

