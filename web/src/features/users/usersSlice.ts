import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {User} from "../../interfaces.ts";
import {listUsersAction} from "./usersActions.ts";

interface UsersState {
    users: User[] | null;
    error: string | null;
}

const initialState: UsersState = {
    users: [],
    error: null,
};

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(listUsersAction.pending, (state) => {
                state.error = null;
            })
            .addCase(listUsersAction.fulfilled, (state, action: PayloadAction<any>) => {
                state.users = action.payload;
                state.error = null;
            })
            .addCase(listUsersAction.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
    selectors: {
        selectUsersList: state => state.users,
    }
});

export const {
    selectUsersList,
} = usersSlice.selectors;

export default usersSlice.reducer;