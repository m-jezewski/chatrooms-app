import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { joinedRoom } from './roomMembershipSlice.ts';

const { recordRecentRoom, io } = vi.hoisted(() => ({
  recordRecentRoom: vi.fn(),
  io: vi.fn(() => ({
    connected: false,
    on: vi.fn(),
    emit: vi.fn(),
    removeAllListeners: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

vi.mock('../../utils/recentRooms.ts', () => ({ recordRecentRoom }));
vi.mock('socket.io-client', () => ({ default: io }));

const loadApp = async () => {
  const [{ store }, { chatroomsApi }] = await Promise.all([
    import('../../store.ts'),
    import('../../services/chatroomsApi.ts'),
  ]);

  const knownRoom = async (roomId: string, name: string) => {
    await store.dispatch(chatroomsApi.util.upsertQueryData('getRoomEntry', roomId, { roomId, name, salt: 'c2FsdA==' }));
  };

  return { store, knownRoom };
};

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('VITE_API_URL', 'http://api.test');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('keeping the recent rooms list up to date', () => {
  it('records a room the moment it is joined, under the name the entry already carried', async () => {
    const { store, knownRoom } = await loadApp();
    await knownRoom('room-1', 'Design crit');

    store.dispatch(joinedRoom('room-1'));

    expect(recordRecentRoom).toHaveBeenCalledWith({ roomId: 'room-1', name: 'Design crit' });
  });

  it('records the room that was joined, not another one it happens to know', async () => {
    const { store, knownRoom } = await loadApp();
    await knownRoom('room-1', 'Design crit');
    await knownRoom('room-2', 'Standup');

    store.dispatch(joinedRoom('room-2'));

    expect(recordRecentRoom).toHaveBeenCalledTimes(1);
    expect(recordRecentRoom).toHaveBeenCalledWith({ roomId: 'room-2', name: 'Standup' });
  });

  it('records nothing it would have to invent a name for', async () => {
    const { store } = await loadApp();

    store.dispatch(joinedRoom('room-1'));

    expect(recordRecentRoom).not.toHaveBeenCalled();
  });
});
