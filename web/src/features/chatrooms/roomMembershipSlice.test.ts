import { describe, expect, it } from 'vitest';
import reducer, { closedRoom, joinedRoom, membershipRefused } from './roomMembershipSlice';

const inRoom = (roomId: string) => reducer(undefined, joinedRoom(roomId));

describe('joinedRoom', () => {
  it('records the room the server let us into', () => {
    expect(inRoom('room-a').joinedChannelId).toBe('room-a');
  });

  it('gives another room a fresh attempt', () => {
    const refused = reducer(inRoom('room-a'), membershipRefused());
    expect(reducer(refused, joinedRoom('room-b')).rejoinedFor).toBeNull();
  });
});

describe('membershipRefused', () => {
  it('drops membership so the room is joined again', () => {
    const state = reducer(inRoom('room-a'), membershipRefused());
    expect(state).toMatchObject({ joinedChannelId: null, rejoinedFor: 'room-a', lostAccessTo: null });
  });

  it('keeps the room on a second refusal instead of looping', () => {
    const rejoined = reducer(reducer(inRoom('room-a'), membershipRefused()), joinedRoom('room-a'));
    const state = reducer(rejoined, membershipRefused());

    expect(state).toMatchObject({ joinedChannelId: 'room-a', lostAccessTo: 'room-a' });
  });

  it('ignores a refusal when no room is open', () => {
    expect(reducer(undefined, membershipRefused())).toMatchObject({ joinedChannelId: null, rejoinedFor: null });
  });
});

describe('closedRoom', () => {
  it('forgets everything so the next visit starts over', () => {
    const state = reducer(reducer(inRoom('room-a'), membershipRefused()), closedRoom());
    expect(state).toEqual({ joinedChannelId: null, rejoinedFor: null, lostAccessTo: null });
  });
});
