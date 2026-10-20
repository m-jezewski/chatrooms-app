import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getRecentRooms,
  RECENT_ROOMS_LIMIT,
  recordRecentRoom,
  removeRecentRoom,
  subscribeToRecentRooms,
} from './recentRooms';

const memoryStorage = () => {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index: number) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
  };
};

const seed = (rooms: { roomId: string; name: string; lastSeenAt?: number }[]) =>
  localStorage.setItem('recentRooms', JSON.stringify(rooms));

const ids = () => getRecentRooms().map((room) => room.roomId);

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getRecentRooms', () => {
  it('returns an empty list when nothing was stored', () => {
    expect(getRecentRooms()).toEqual([]);
  });

  it('survives junk in storage', () => {
    localStorage.setItem('recentRooms', 'not json');
    expect(getRecentRooms()).toEqual([]);

    localStorage.setItem('recentRooms', '{"roomId":"a"}');
    expect(getRecentRooms()).toEqual([]);
  });
});

describe('recordRecentRoom', () => {
  it('stamps the room with the time it was seen', () => {
    const before = Date.now();
    recordRecentRoom({ roomId: 'a', name: 'Alpha' });

    const [room] = getRecentRooms();
    expect(room).toMatchObject({ roomId: 'a', name: 'Alpha' });
    expect(room.lastSeenAt).toBeGreaterThanOrEqual(before);
  });

  it('refreshes an already known room instead of duplicating it', () => {
    seed([
      { roomId: 'a', name: 'Alpha', lastSeenAt: 1 },
      { roomId: 'b', name: 'Beta', lastSeenAt: 2 },
    ]);

    recordRecentRoom({ roomId: 'a', name: 'Alpha renamed' });

    const rooms = getRecentRooms();
    expect(ids()).toEqual(['a', 'b']);
    expect(rooms[0].name).toBe('Alpha renamed');
    expect(rooms[0].lastSeenAt).toBeGreaterThan(2);
  });
});

describe('capping the list at the limit', () => {
  const atLimit = Array.from({ length: RECENT_ROOMS_LIMIT }, (_unused, index) => ({
    roomId: `room-${index}`,
    name: `Room ${index}`,
    lastSeenAt: index + 1,
  }));
  const oldest = atLimit[0].roomId;
  const newest = atLimit[atLimit.length - 1].roomId;

  it('keeps every room while the limit is not exceeded', () => {
    seed(atLimit.slice(0, -1));
    recordRecentRoom({ roomId: 'fresh', name: 'Fresh' });

    expect(getRecentRooms()).toHaveLength(RECENT_ROOMS_LIMIT);
    expect(ids()).toContain(oldest);
  });

  it('drops the room seen longest ago, not the newest ones', () => {
    seed(atLimit);
    recordRecentRoom({ roomId: 'fresh', name: 'Fresh' });

    const kept = ids();
    expect(kept).toHaveLength(RECENT_ROOMS_LIMIT);
    expect(kept).toContain('fresh');
    expect(kept).not.toContain(oldest);
    expect(kept).toContain(newest);
  });

  it('drops rooms stored before lastSeenAt existed first', () => {
    seed([{ roomId: 'legacy', name: 'Legacy' }, ...atLimit]);
    recordRecentRoom({ roomId: 'fresh', name: 'Fresh' });

    const kept = ids();
    expect(kept).toHaveLength(RECENT_ROOMS_LIMIT);
    expect(kept).not.toContain('legacy');
    expect(kept).not.toContain(oldest);
  });

  it('leaves the display order of the survivors alone', () => {
    seed(atLimit);
    recordRecentRoom({ roomId: 'fresh', name: 'Fresh' });

    expect(ids()).toEqual(['fresh', ...atLimit.slice(1).map((room) => room.roomId)]);
  });
});

describe('removeRecentRoom', () => {
  it('removes only the room it was given', () => {
    seed([
      { roomId: 'a', name: 'Alpha', lastSeenAt: 1 },
      { roomId: 'b', name: 'Beta', lastSeenAt: 2 },
    ]);

    removeRecentRoom('a');
    expect(ids()).toEqual(['b']);
  });

  it('is a no-op for an unknown room', () => {
    seed([{ roomId: 'a', name: 'Alpha', lastSeenAt: 1 }]);

    removeRecentRoom('nope');
    expect(ids()).toEqual(['a']);
  });
});

describe('getRecentRooms reference', () => {
  it('hands back the same list until storage changes', () => {
    seed([{ roomId: 'a', name: 'Alpha', lastSeenAt: 1 }]);

    const first = getRecentRooms();
    expect(getRecentRooms()).toBe(first);

    recordRecentRoom({ roomId: 'b', name: 'Beta' });
    expect(getRecentRooms()).not.toBe(first);
  });
});

describe('subscribeToRecentRooms', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });

  it('tells subscribers that the list changed', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToRecentRooms(listener);

    recordRecentRoom({ roomId: 'a', name: 'Alpha' });
    removeRecentRoom('a');
    unsubscribe();

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('goes quiet after unsubscribing', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToRecentRooms(listener);

    unsubscribe();
    recordRecentRoom({ roomId: 'a', name: 'Alpha' });

    expect(listener).not.toHaveBeenCalled();
  });

  it('watches for another tab only while someone is subscribed', () => {
    const unsubscribe = subscribeToRecentRooms(vi.fn());
    expect(window.addEventListener).toHaveBeenCalledWith('storage', expect.any(Function));

    unsubscribe();
    expect(window.removeEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
  });
});
