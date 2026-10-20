import { describe, expect, it } from 'vitest';
import reducer, {
  connectionClosed,
  connectionError,
  connectionOpened,
  openedChannel,
  prependMessages,
  receivedMessage,
  setMessages,
} from './messagesSlice';
import { Message } from '../../interfaces.ts';

const message = (id: string, textChannelId: string): Message => ({
  id,
  payload: `cipher-${id}`,
  senderId: 'sender',
  createdAt: new Date('2026-10-18T10:00:00Z'),
  textChannelId,
});

const inRoom = (channelId: string) => reducer(reducer(undefined, connectionOpened()), openedChannel(channelId));

describe('openedChannel', () => {
  it('drops the previous room messages', () => {
    const withMessages = reducer(inRoom('room-a'), receivedMessage(message('1', 'room-a')));
    expect(withMessages.messages).toHaveLength(1);

    const switched = reducer(withMessages, openedChannel('room-b'));
    expect(switched.messages).toEqual([]);
    expect(switched.channelId).toBe('room-b');
  });

  it('leaves the connection alone', () => {
    const state = reducer(inRoom('room-a'), openedChannel(null));
    expect(state.isConnected).toBe(true);
    expect(state.channelId).toBeNull();
  });
});

describe('setMessages', () => {
  it('fills the history of the room that is open', () => {
    const state = reducer(
      inRoom('room-a'),
      setMessages({ channelId: 'room-a', messages: [message('1', 'room-a')], hasMore: false }),
    );

    expect(state.messages).toHaveLength(1);
  });

  it('ignores a history that belongs to another room', () => {
    const state = reducer(
      inRoom('room-b'),
      setMessages({ channelId: 'room-a', messages: [message('1', 'room-a')], hasMore: false }),
    );

    expect(state.messages).toEqual([]);
  });

  it('believes the server about there being nothing older', () => {
    const state = reducer(
      inRoom('room-a'),
      setMessages({ channelId: 'room-a', messages: [message('1', 'room-a')], hasMore: false }),
    );

    expect(state.hasMore).toBe(false);
  });

  it('starts a freshly opened room ready to scroll back', () => {
    const shortRoom = reducer(
      inRoom('room-a'),
      setMessages({ channelId: 'room-a', messages: [message('1', 'room-a')], hasMore: false }),
    );

    expect(reducer(shortRoom, openedChannel('room-b')).hasMore).toBe(true);
  });
});

describe('receivedMessage', () => {
  it('appends a message from the open room', () => {
    const state = reducer(inRoom('room-a'), receivedMessage(message('1', 'room-a')));
    expect(state.messages).toHaveLength(1);
  });

  it('ignores a message from another room', () => {
    const state = reducer(inRoom('room-a'), receivedMessage(message('1', 'room-b')));
    expect(state.messages).toEqual([]);
  });
});

describe('prependMessages', () => {
  it('puts an older page in front of what is already there', () => {
    const current = reducer(inRoom('room-a'), receivedMessage(message('2', 'room-a')));
    const state = reducer(
      current,
      prependMessages({ channelId: 'room-a', messages: [message('1', 'room-a')], hasMore: false }),
    );

    expect(state.messages.map((entry) => entry.id)).toEqual(['1', '2']);
    expect(state.hasMore).toBe(false);
  });

  it('ignores a page fetched for the room the user just left', () => {
    const state = reducer(
      inRoom('room-b'),
      prependMessages({ channelId: 'room-a', messages: [message('1', 'room-a')], hasMore: false }),
    );

    expect(state.messages).toEqual([]);
    expect(state.hasMore).toBe(true);
  });
});

describe('connection state', () => {
  it('clears the last error once the socket is back', () => {
    const state = reducer(reducer(undefined, connectionError('Cannot reach the chat server')), connectionOpened());
    expect(state).toMatchObject({ isConnected: true, error: null });
  });

  it('an error means not connected', () => {
    const state = reducer(reducer(undefined, connectionOpened()), connectionError('boom'));
    expect(state).toMatchObject({ isConnected: false, error: 'boom' });
  });

  it('a close keeps the error for the banner to show', () => {
    const state = reducer(reducer(undefined, connectionError('boom')), connectionClosed());
    expect(state.error).toBe('boom');
  });
});
