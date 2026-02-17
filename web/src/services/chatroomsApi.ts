import {api} from './api.ts';
import {Chatroom} from '../interfaces.ts';

export const chatroomsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getChatrooms: builder.query<Chatroom[], void>({
            query: () => '/textChannels/',
            providesTags: ['ChatroomList'],
        }),
        getChatroomById: builder.query<Chatroom & { users: { id: number }[] }, number>({
            query: (id) => `/textChannels/${id}`,
            providesTags: (_result, _error, id) => [{type: 'Chatroom', id}],
        }),
        createChatroom: builder.mutation<Chatroom, { name: string; users: number[] }>({
            query: (channelData) => ({
                url: '/textChannels/create',
                method: 'POST',
                body: channelData,
            }),
            invalidatesTags: ['ChatroomList'],
        }),
        updateChatroom: builder.mutation<Chatroom, { id: number; name: string; users: number[] }>({
            query: ({id, ...body}) => ({
                url: `/textChannels/${id}`,
                method: 'PUT',
                body: {id, ...body},
            }),
            invalidatesTags: (_result, _error, {id}) => ['ChatroomList', {type: 'Chatroom', id}],
        }),
        deleteChatroom: builder.mutation<void, number>({
            query: (id) => ({
                url: `/textChannels/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ChatroomList'],
        }),
    }),
});

export const {
    useGetChatroomsQuery,
    useGetChatroomByIdQuery,
    useCreateChatroomMutation,
    useUpdateChatroomMutation,
    useDeleteChatroomMutation,
} = chatroomsApi;
