import {api} from './api.ts';
import {Chatroom, Message} from '../interfaces.ts';

export const chatroomsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getChatrooms: builder.query<Chatroom[], void>({
            query: () => '/textChannels/',
            providesTags: ['ChatroomList'],
        }),
        getChatroomById: builder.query<Chatroom, string>({
            query: (id) => `/textChannels/${id}`,
            providesTags: (_result, _error, id) => [{type: 'Chatroom', id}],
        }),
        createChatroom: builder.mutation<Chatroom, {
            name: string;
            users: string[];
            salt: string;
            authKey: string;
        }>({
            query: (channelData) => ({
                url: '/textChannels/create',
                method: 'POST',
                body: channelData,
            }),
            invalidatesTags: ['ChatroomList'],
        }),
        joinChatroom: builder.mutation<{ joined: boolean }, { channelId: string; authKey: string }>({
            query: ({channelId, authKey}) => ({
                url: `/textChannels/${channelId}/join`,
                method: 'POST',
                body: {authKey},
            }),
        }),
        updateChatroom: builder.mutation<Chatroom, { id: string; name: string; users: string[] }>({
            query: ({id, ...body}) => ({
                url: `/textChannels/${id}`,
                method: 'PUT',
                body: {id, ...body},
            }),
            invalidatesTags: (_result, _error, {id}) => ['ChatroomList', {type: 'Chatroom', id}],
        }),
        deleteChatroom: builder.mutation<void, string>({
            query: (id) => ({
                url: `/textChannels/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ChatroomList'],
        }),
        getOlderMessages: builder.query<
            { messages: Message[], hasMore: boolean },
            { channelId: string, before: string, limit?: number }
        >({
            query: ({ channelId, before, limit = 20 }) =>
                `/textChannels/${channelId}/messages?before=${before}&limit=${limit}`,
        }),
    }),
});

export const {
    useGetChatroomsQuery,
    useGetChatroomByIdQuery,
    useCreateChatroomMutation,
    useJoinChatroomMutation,
    useUpdateChatroomMutation,
    useDeleteChatroomMutation,
    useLazyGetOlderMessagesQuery,
} = chatroomsApi;