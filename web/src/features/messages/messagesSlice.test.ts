import { describe, expect, it } from 'vitest';
import reducer, {
  connectionClosed,
  connectionFailed,
  connectionOpened,
  channelOpened,
  olderMessagesLoaded,
  messageReceived,
  historyLoaded,
} from './messagesSlice';
import { Message } from '../../interfaces.ts';

const message = (id: string, textChannelId: string): Message => ({
  id,
  payload: `cipher-${id}`,
  senderId: 'sender',
  createdAt: '2026-10-18T10:00:00.000Z',
  textChannelId,
});

const inRoom = (channelId: string) => reducer(reducer(undefined, connectionOpened()), channelOpened(channelId));

describe('channelOpened', () => {
  it('drops the previous room messages', () => {
    const withMessages = reducer(inRoom('room-a'), messageReceived(message('1', 'room-a')));
    expect(withMessages.messages).toHaveLength(1);

    const switched = reducer(withMessages, channelOpened('room-b'));
    expect(switched.messages).toEqual([]);
    expect(switched.channelId).toBe('room-b');
  });

  it('leaves the connection alone', () => {
    const state = reducer(inRoom('room-a'), channelOpened(null));
    expect(state.isConnected).toBe(true);
    expect(state.channelId).toBeNull();
  });
});

describe('historyLoaded', () => {
  it('fills the history of the room that is open', () => {
    const state = reducer(
      inRoom('room-a'),
      historyLoaded({ channelId: 'room-a', messages: [message('1', 'room-a')], hasMore: false }),
    );

    expect(state.messages).toHaveLength(1);
  });

  it('ignores a history that belongs to another room', () => {
    const state = reducer(
      inRoom('room-b'),
      historyLoaded({ channelId: 'room-a', messages: [message('1', 'room-a')], hasMore: false }),
    );

    expect(state.messages).toEqual([]);
  });

  it('believes the server about there being nothing older', () => {
    const state = reducer(
      inRoom('room-a'),
      historyLoaded({ channelId: 'room-a', messages: [message('1', 'room-a')], hasMore: false }),
    );

    expect(state.hasMore).toBe(false);
  });

  it('starts a freshly opened room ready to scroll back', () => {
    const shortRoom = reducer(
      inRoom('room-a'),
      historyLoaded({ channelId: 'room-a', messages: [message('1', 'room-a')], hasMore: false }),
    );

    expect(reducer(shortRoom, channelOpened('room-b')).hasMore).toBe(true);
  });
});

describe('messageReceived', () => {
  it('appends a message from the open room', () => {
    const state = reducer(inRoom('room-a'), messageReceived(message('1', 'room-a')));
    expect(state.messages).toHaveLength(1);
  });

  it('ignores a message from another room', () => {
    const state = reducer(inRoom('room-a'), messageReceived(message('1', 'room-b')));
    expect(state.messages).toEqual([]);
  });
});

describe('olderMessagesLoaded', () => {
  it('puts an older page in front of what is already there', () => {
    const current = reducer(inRoom('room-a'), messageReceived(message('2', 'room-a')));
    const state = reducer(
      current,
      olderMessagesLoaded({ channelId: 'room-a', messages: [message('1', 'room-a')], hasMore: false }),
    );

    expect(state.messages.map((entry) => entry.id)).toEqual(['1', '2']);
    expect(state.hasMore).toBe(false);
  });

  it('ignores a page fetched for the room the user just left', () => {
    const state = reducer(
      inRoom('room-b'),
      olderMessagesLoaded({ channelId: 'room-a', messages: [message('1', 'room-a')], hasMore: false }),
    );

    expect(state.messages).toEqual([]);
    expect(state.hasMore).toBe(true);
  });
});

describe('connection state', () => {
  it('clears the last error once the socket is back', () => {
    const state = reducer(reducer(undefined, connectionFailed('Cannot reach the chat server')), connectionOpened());
    expect(state).toMatchObject({ isConnected: true, error: null });
  });

  it('an error means not connected', () => {
    const state = reducer(reducer(undefined, connectionOpened()), connectionFailed('boom'));
    expect(state).toMatchObject({ isConnected: false, error: 'boom' });
  });

  it('a close keeps the error for the banner to show', () => {
    const state = reducer(reducer(undefined, connectionFailed('boom')), connectionClosed());
    expect(state.error).toBe('boom');
  });
});
