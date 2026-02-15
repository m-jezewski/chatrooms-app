import {logout} from "../features/auth/authSlice.ts";
import {Dispatch, UnknownAction} from "@reduxjs/toolkit";

export const apiUrl = 'http://localhost:3000';

interface apiRequestInterface {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: Record<string, unknown>
    dispatch: Dispatch<UnknownAction>
}

export const apiRequest = async (
    {
        endpoint,
        method,
        body,
        dispatch,
    }:
    apiRequestInterface) => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const options: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
    };

    try {
        const response = await fetch(`${apiUrl}${endpoint}`, options);

        if (response.status === 401 || response.status === 403) {
            await dispatch(logout());
            return
        }

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};