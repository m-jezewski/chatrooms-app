const RECENT_ROOMS_KEY = 'recentRooms';
export const RECENT_ROOMS_LIMIT = 50;

export interface RecentRoom {
  roomId: string;
  name: string;
  lastSeenAt?: number;
}

// Localstorage store for keeping saved chatrooms and subscribing via useSyncExternalStore

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedRooms: RecentRoom[] = [];

function onStorage(event: StorageEvent): void {
  if (event.key === null || event.key === RECENT_ROOMS_KEY) {
    listeners.forEach((listener) => listener());
  }
}

export function subscribeToRecentRooms(listener: () => void): () => void {
  if (listeners.size === 0) {
    window.addEventListener('storage', onStorage);
  }

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('storage', onStorage);
    }
  };
}

export function getRecentRooms(): RecentRoom[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(RECENT_ROOMS_KEY);
  } catch {
    return [];
  }

  if (raw === cachedRaw) {
    return cachedRooms;
  }

  cachedRaw = raw;
  cachedRooms = parseRooms(raw);
  return cachedRooms;
}

export function recordRecentRoom(room: RecentRoom): void {
  const rooms = getRecentRooms();
  const index = rooms.findIndex((entry) => entry.roomId === room.roomId);
  const seen = { ...room, lastSeenAt: Date.now() };

  const next =
    index === -1
      ? [seen, ...rooms]
      : rooms.map((entry, entryIndex) => (entryIndex === index ? { ...entry, ...seen } : entry));

  localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(capToLimit(next)));
  listeners.forEach((listener) => listener());
}

export function removeRecentRoom(roomId: string): void {
  const next = getRecentRooms().filter((entry) => entry.roomId !== roomId);
  localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

function parseRooms(raw: string | null): RecentRoom[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function capToLimit(rooms: RecentRoom[]): RecentRoom[] {
  if (rooms.length <= RECENT_ROOMS_LIMIT) return rooms;

  const keep = new Set(
    [...rooms]
      .sort((roomA, roomB) => (roomB.lastSeenAt ?? 0) - (roomA.lastSeenAt ?? 0))
      .slice(0, RECENT_ROOMS_LIMIT)
      .map((room) => room.roomId),
  );

  return rooms.filter((room) => keep.has(room.roomId));
}
