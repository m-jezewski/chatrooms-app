import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store.ts';

interface RoomMembershipState {
  joinedChannelId: string | null;
  rejoinedFor: string | null;
  lostAccessTo: string | null;
}

const initialState: RoomMembershipState = {
  joinedChannelId: null,
  rejoinedFor: null,
  lostAccessTo: null,
};

const roomMembershipSlice = createSlice({
  name: 'roomMembership',
  initialState,
  reducers: {
    joinedRoom(state, action: PayloadAction<string>) {
      if (state.rejoinedFor !== action.payload) {
        state.rejoinedFor = null;
      }

      state.lostAccessTo = null;
      state.joinedChannelId = action.payload;
    },
    membershipRefused(state) {
      if (!state.joinedChannelId) {
        return;
      }

      if (state.rejoinedFor === state.joinedChannelId) {
        state.lostAccessTo = state.joinedChannelId;
        return;
      }

      state.rejoinedFor = state.joinedChannelId;
      state.joinedChannelId = null;
    },
    closedRoom() {
      return initialState;
    },
  },
});

export const { joinedRoom, membershipRefused, closedRoom } = roomMembershipSlice.actions;

export const selectJoinedChannelId = (state: RootState) => state.roomMembership.joinedChannelId;
export const selectLostAccessTo = (state: RootState) => state.roomMembership.lostAccessTo;

export default roomMembershipSlice.reducer;
