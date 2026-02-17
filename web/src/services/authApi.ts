import {api} from './api.ts';
import {User} from '../interfaces.ts';
import {clearUser, setUser} from '../features/auth/authSlice.ts';

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<User, { email: string; password: string }>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_, {dispatch, queryFulfilled}) {
                try {
                    const {data} = await queryFulfilled;
                    dispatch(setUser(data));
                } catch {
                    // error handled by component
                }
            },
        }),
        register: builder.mutation<User, { email: string; password: string; name: string }>({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData,
            }),
            async onQueryStarted(_, {dispatch, queryFulfilled}) {
                try {
                    const {data} = await queryFulfilled;
                    dispatch(setUser(data));
                } catch {
                    // error handled by component
                }
            },
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'DELETE',
            }),
            async onQueryStarted(_, {dispatch, queryFulfilled}) {
                try {
                    await queryFulfilled;
                    dispatch(clearUser());
                } catch {
                    // error handled by component
                }
            },
        }),
        status: builder.query<User, void>({
            query: () => '/auth/status',
            async onQueryStarted(_, {dispatch, queryFulfilled}) {
                try {
                    const {data} = await queryFulfilled;
                    dispatch(setUser(data));
                } catch {
                    // not logged in
                }
            },
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useStatusQuery,
} = authApi;
