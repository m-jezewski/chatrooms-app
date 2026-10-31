import { chatroomsApi } from '../../services/chatroomsApi.ts';
import { recordRecentRoom } from '../../utils/recentRooms.ts';
import { roomJoined } from './roomMembershipSlice.ts';
import type { AppStartListening } from '../../listenerMiddleware.ts';

export const addRecentRoomListeners = (startListening: AppStartListening) => {
  startListening({
    actionCreator: roomJoined,
    effect: (action, listenerApi) => {
      const entry = chatroomsApi.endpoints.getRoomEntry.select(action.payload)(listenerApi.getState()).data;

      if (entry) {
        recordRecentRoom({ roomId: entry.roomId, name: entry.name });
      }
    },
  });
};
