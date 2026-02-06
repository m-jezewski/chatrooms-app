import {createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from "../../utils/httpRequest.ts";

export const createChatroomAction = createAsyncThunk(
    'textChannels/create',
    async (channelData: { name: string; users: number[] }, {dispatch, rejectWithValue}) => {
        try {
            return await apiRequest({
                endpoint: '/textChannels/create',
                method: 'POST',
                body: channelData,
                dispatch: dispatch
            });

        } catch (error) {
            let message = 'Unknown Error'
            if (error instanceof Error) message = error.message
            return rejectWithValue(message);
        }
    }
);

export const listChatroomsAction = createAsyncThunk(
    'textChannels/list',
    async (_, {dispatch, rejectWithValue}) => {
        try {
            return await apiRequest({
                endpoint: '/textChannels/',
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

export const getChatroomByIdAction = createAsyncThunk(
    'textChannels/getById',
    async ({channelId}: { channelId: number }, {dispatch, rejectWithValue}) => {
        try {
            return await apiRequest({
                endpoint: `/textChannels/${channelId}`,
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

export const updateChatroomDataAction = createAsyncThunk(
    'textChannels/update',
    async (
        channelData: { id: number, name: string, users: number[] , }, {
            dispatch,
            rejectWithValue
        }) => {
        try {
            const {id} = channelData
            return await apiRequest({
                endpoint: `/textChannels/${id}`,
                method: 'PUT',
                dispatch: dispatch,
                body: channelData,
            });

        } catch (error) {
            let message = 'Unknown Error'
            if (error instanceof Error) message = error.message
            return rejectWithValue(message);
        }
    }
);

export const deleteChatroomAction = createAsyncThunk(
    'users/delete',
    async ({channelId}: { channelId: number }, {dispatch, rejectWithValue}) => {
        try {
            return await apiRequest({
                endpoint: `/textChannels/${channelId}`,
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

