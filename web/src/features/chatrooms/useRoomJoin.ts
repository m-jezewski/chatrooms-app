import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useJoinChatroomMutation } from '../../services/chatroomsApi.ts';
import { recordRecentRoom } from '../../utils/recentRooms.ts';
import { RoomSecrets } from '../../utils/roomCrypto.ts';
import { RoomEntry } from '../../interfaces.ts';
import { closedRoom, joinedRoom, selectJoinedChannelId } from './roomMembershipSlice.ts';

interface RoomJoinParams {
  channelId?: string;
  secrets?: RoomSecrets;
  entry?: RoomEntry;
}

export const useRoomJoin = ({ channelId, secrets, entry }: RoomJoinParams) => {
  const dispatch = useDispatch();
  const joinedChannelId = useSelector(selectJoinedChannelId);
  const [joinChatroom] = useJoinChatroomMutation();
  const joined = !!channelId && joinedChannelId === channelId;

  useEffect(() => {
    if (!channelId || !secrets || joinedChannelId === channelId) return;
    let cancelled = false;

    joinChatroom({ channelId, authKey: secrets.authKey })
      .unwrap()
      .then(() => {
        if (!cancelled) dispatch(joinedRoom(channelId));
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to join the room.');
      });

    return () => {
      cancelled = true;
    };
  }, [channelId, secrets, joinedChannelId, joinChatroom, dispatch]);

  useEffect(() => {
    if (joined && entry) {
      recordRecentRoom({ roomId: entry.roomId, name: entry.name });
    }
  }, [joined, entry]);

  useEffect(() => {
    return () => {
      dispatch(closedRoom());
    };
  }, [channelId, dispatch]);

  const markJoined = useCallback((roomId: string) => dispatch(joinedRoom(roomId)), [dispatch]);

  return { joined, markJoined };
};
