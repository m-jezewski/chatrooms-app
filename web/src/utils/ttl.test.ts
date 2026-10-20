import { describe, expect, it } from 'vitest';
import { DEFAULT_TTL_MS, TTL_OPTIONS, ttlOptionsFor } from './ttl.ts';

const valueOf = (label: string) => TTL_OPTIONS.find((option) => option.label === label)?.value;

describe('room lifetime options', () => {
  it('offers "never" only to someone with an account', () => {
    expect(ttlOptionsFor(true)).toEqual(TTL_OPTIONS);
    expect(ttlOptionsFor(false).map((option) => option.value)).not.toContain(null);
    expect(ttlOptionsFor(false)).toHaveLength(TTL_OPTIONS.length - 1);
  });

  it('keeps the longest anonymous option on the cap the server enforces', () => {
    expect(valueOf('1 month')).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it('defaults to a lifetime the user could also pick by hand', () => {
    expect(TTL_OPTIONS.map((option) => option.value)).toContain(DEFAULT_TTL_MS);
  });

  it('counts every option in whole milliseconds', () => {
    const lifetimes = TTL_OPTIONS.map((option) => option.value).filter((value) => value !== null);

    expect(lifetimes.every((value) => Number.isInteger(value))).toBe(true);
    expect(Math.min(...lifetimes)).toBeGreaterThanOrEqual(60 * 1000);
  });
});
