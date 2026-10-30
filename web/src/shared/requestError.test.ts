import { describe, expect, it } from 'vitest';
import { ERROR_MESSAGES, failureMessage, getErrorStatus } from './requestError.ts';

describe('getErrorStatus', () => {
  it('reads the status off a rejected query', () => {
    expect(getErrorStatus({ status: 404 })).toBe(404);
  });

  it('survives a rejection that carries no status at all', () => {
    expect(getErrorStatus(undefined)).toBeUndefined();
    expect(getErrorStatus(new Error('offline'))).toBeUndefined();
  });
});

describe('failureMessage', () => {
  it('answers with the wording the caller chose for that status', () => {
    expect(failureMessage({ status: 429 }, 'Failed to log in.', { 429: ERROR_MESSAGES.RETRY_IN_A_MINUTE })).toBe(
      ERROR_MESSAGES.RETRY_IN_A_MINUTE,
    );
  });

  it('answers with the wording for the action when the status is not spelled out', () => {
    expect(failureMessage({ status: 500 }, 'Failed to log in.', { 429: ERROR_MESSAGES.RETRY_IN_A_MINUTE })).toBe(
      'Failed to log in.',
    );
  });

  it('never repeats what the server said, however human it sounds', () => {
    const rejection = { status: 403, data: { message: 'Only the room owner can manage this room' } };

    expect(failureMessage(rejection, 'Failed to edit the room.')).toBe('Failed to edit the room.');
  });

  it('never leaks framework wording either', () => {
    const rejection = { status: 429, data: { message: 'ThrottlerException: Too Many Requests' } };

    expect(failureMessage(rejection, 'Failed to register.')).toBe('Failed to register.');
  });

  it('answers for a rejection that never reached the server', () => {
    expect(failureMessage({ status: 'FETCH_ERROR', error: 'offline' }, 'Failed to save.')).toBe('Failed to save.');
    expect(failureMessage(undefined, 'Failed to save.')).toBe('Failed to save.');
  });
});
