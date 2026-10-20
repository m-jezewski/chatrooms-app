import { describe, expect, it } from 'vitest';
import { getPathWithParams } from './entryHandoff.ts';

describe('getPathWithParams', () => {
  it('sends someone with nothing to hand over straight to the rooms screen', () => {
    expect(getPathWithParams({ action: null })).toBe('/chatrooms');
    expect(getPathWithParams({ action: null, inviteCode: 'K7QF9M2X' })).toBe('/chatrooms');
  });

  it('carries the action through', () => {
    expect(getPathWithParams({ action: 'create' })).toBe('/chatrooms?action=create');
  });

  it('carries the invite code along with the action', () => {
    expect(getPathWithParams({ action: 'join', inviteCode: 'K7QF9M2X' })).toBe('/chatrooms?action=join&code=K7QF9M2X');
  });

  it('escapes a code that would otherwise break the query string', () => {
    expect(getPathWithParams({ action: 'join', inviteCode: 'a&b=c' })).toBe('/chatrooms?action=join&code=a%26b%3Dc');
  });
});
