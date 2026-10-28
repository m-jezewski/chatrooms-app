import { describe, expect, it } from 'vitest';
import { startsRun } from './messageRuns.ts';
import { Message } from '../../interfaces.ts';

const at = (minutes: number, senderId = 'ada'): Message => ({
  id: `${senderId}-${minutes}`,
  payload: 'cipher',
  senderId,
  createdAt: new Date(Date.UTC(2026, 9, 18, 10, minutes)).toISOString(),
  textChannelId: 'room-1',
});

describe('startsRun', () => {
  it('starts a run when nothing came before', () => {
    expect(startsRun(at(0), undefined)).toBe(true);
  });

  it('continues the run of the same author writing again right away', () => {
    expect(startsRun(at(1), at(0))).toBe(false);
  });

  it('continues the run up to the last minute before the gap', () => {
    expect(startsRun(at(9), at(0))).toBe(false);
  });

  it('starts a run when the author changes', () => {
    expect(startsRun(at(1, 'bob'), at(0, 'ada'))).toBe(true);
  });

  it('starts a run on a pause of exactly ten minutes', () => {
    expect(startsRun(at(10), at(0))).toBe(true);
  });

  it('starts a run when the same author comes back much later', () => {
    expect(startsRun(at(45), at(0))).toBe(true);
  });

  it('measures the pause from the previous message, not from the start of the run', () => {
    expect(startsRun(at(18), at(9))).toBe(false);
  });
});
