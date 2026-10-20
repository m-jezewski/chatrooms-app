import { activeRoomWhere, ANONYMOUS_TTL_MAX_MS, TTL_MAX_MS, TTL_MIN_MS } from './room-expiry';

describe('room expiry limits', () => {
  it('pins the lifetimes the client is allowed to ask for', () => {
    expect(TTL_MIN_MS).toBe(60 * 1000);
    expect(TTL_MAX_MS).toBe(365 * 24 * 60 * 60 * 1000);
    expect(ANONYMOUS_TTL_MAX_MS).toBe(30 * 24 * 60 * 60 * 1000);
  });
});

describe('activeRoomWhere', () => {
  it('keeps the lookup it was given and only adds the expiry filter', () => {
    const where = activeRoomWhere({ id: 'room-1' });

    expect(where.id).toBe('room-1');
    expect(where.OR).toHaveLength(2);
  });

  it('treats a room without an expiry and a room expiring later as alive', () => {
    const before = Date.now();
    const [never, later] = activeRoomWhere({ inviteCode: 'K7QF9M2X' }).OR as [
      { expiresAt: null },
      { expiresAt: { gt: Date } },
    ];
    const cutoff = later.expiresAt.gt as Date;

    expect(never).toEqual({ expiresAt: null });
    expect(cutoff.getTime()).toBeGreaterThanOrEqual(before);
    expect(cutoff.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('asks for the cutoff fresh on every call', () => {
    const first = activeRoomWhere({ id: 'room-1' });
    const second = activeRoomWhere({ id: 'room-1' });

    expect(first.OR).not.toBe(second.OR);
  });
});
