const RECENT_ROOMS_KEY = 'recentRooms';
export const RECENT_ROOMS_LIMIT = 50;

export interface RecentRoom {
  roomId: string;
  name: string;
  lastSeenAt?: number;
}

export function getRecentRooms(): RecentRoom[] {
  try {
    const raw = localStorage.getItem(RECENT_ROOMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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
}

export function removeRecentRoom(roomId: string): void {
  const next = getRecentRooms().filter((entry) => entry.roomId !== roomId);
  localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(next));
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
