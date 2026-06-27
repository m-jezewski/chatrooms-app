import {api} from './api.ts';
import {User} from '../interfaces.ts';

export const usersApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<User[], void>({
            query: () => '/users/',
            providesTags: ['UserList'],
        }),
        getUserById: builder.query<User, string>({
            query: (id) => `/users/${id}`,
            providesTags: (_result, _error, id) => [{type: 'User', id}],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
} = usersApi;
