import { api } from './api.ts';
import { Chatroom, CreatedChatroom, Message, RoomLocator, SavedRoom } from '../interfaces.ts';

const ownerHeaders = (ownerToken?: string | null) => (ownerToken ? { 'X-Owner-Token': ownerToken } : undefined);

export const chatroomsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getChatroomById: builder.query<Chatroom, string>({
      query: (id) => `/textChannels/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Chatroom', id }],
    }),
    getRoomByInviteCode: builder.query<RoomLocator, string>({
      query: (inviteCode) => `/textChannels/code/${inviteCode}`,
    }),
    createChatroom: builder.mutation<
      CreatedChatroom,
      {
        name: string;
        salt: string;
        authKey: string;
        expiresAt?: string | null;
      }
    >({
      query: (channelData) => ({
        url: '/textChannels',
        method: 'POST',
        body: channelData,
      }),
    }),
    joinChatroom: builder.mutation<{ joined: boolean }, { channelId: string; authKey: string }>({
      query: ({ channelId, authKey }) => ({
        url: `/textChannels/${channelId}/join`,
        method: 'POST',
        body: { authKey },
      }),
    }),
    updateChatroom: builder.mutation<
      Chatroom,
      {
        id: string;
        name?: string;
        expiresAt?: string | null;
        ownerToken?: string | null;
      }
    >({
      query: ({ id, ownerToken, ...body }) => ({
        url: `/textChannels/${id}`,
        method: 'PUT',
        body,
        headers: ownerHeaders(ownerToken),
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Chatroom', id }],
    }),
    rotateInviteCode: builder.mutation<{ inviteCode: string }, { id: string; ownerToken?: string | null }>({
      query: ({ id, ownerToken }) => ({
        url: `/textChannels/${id}/rotate-code`,
        method: 'POST',
        headers: ownerHeaders(ownerToken),
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Chatroom', id }],
    }),
    deleteChatroom: builder.mutation<void, { id: string; ownerToken?: string | null }>({
      query: ({ id, ownerToken }) => ({
        url: `/textChannels/${id}`,
        method: 'DELETE',
        headers: ownerHeaders(ownerToken),
      }),
    }),
    getOlderMessages: builder.query<
      { messages: Message[]; hasMore: boolean },
      { channelId: string; before: string; limit?: number }
    >({
      query: ({ channelId, before, limit = 20 }) =>
        `/textChannels/${channelId}/messages?before=${before}&limit=${limit}`,
    }),
    getSavedRooms: builder.query<SavedRoom[], void>({
      query: () => '/textChannels/saved',
      providesTags: ['SavedRooms'],
    }),
    saveRoom: builder.mutation<SavedRoom, { id: string; name?: string }>({
      query: ({ id, name }) => ({
        url: `/textChannels/${id}/save`,
        method: 'POST',
        body: name ? { name } : {},
      }),
      invalidatesTags: ['SavedRooms'],
    }),
    unsaveRoom: builder.mutation<void, string>({
      query: (id) => ({
        url: `/textChannels/${id}/save`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SavedRooms'],
    }),
  }),
});

export const {
  useGetChatroomByIdQuery,
  useCreateChatroomMutation,
  useLazyGetRoomByInviteCodeQuery,
  useJoinChatroomMutation,
  useUpdateChatroomMutation,
  useRotateInviteCodeMutation,
  useDeleteChatroomMutation,
  useLazyGetOlderMessagesQuery,
  useGetSavedRoomsQuery,
  useSaveRoomMutation,
  useUnsaveRoomMutation,
} = chatroomsApi;
