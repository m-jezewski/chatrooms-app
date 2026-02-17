import {api} from './api.ts';
import {User} from '../interfaces.ts';

export const usersApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<User[], void>({
            query: () => '/users/',
            providesTags: ['UserList'],
        }),
        getUserById: builder.query<User, number>({
            query: (id) => `/users/${id}`,
            providesTags: (_result, _error, id) => [{type: 'User', id}],
        }),
        createUser: builder.mutation<User, { name: string; email: string; password: string; role: string }>({
            query: (userData) => ({
                url: '/users/create',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['UserList'],
        }),
        updateUser: builder.mutation<User, { id: number; name: string; email: string; role: string }>({
            query: ({id, ...body}) => ({
                url: `/users/${id}`,
                method: 'PATCH',
                body: {id, ...body},
            }),
            invalidatesTags: ['UserList'],
        }),
        deleteUser: builder.mutation<void, number>({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['UserList'],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = usersApi;
