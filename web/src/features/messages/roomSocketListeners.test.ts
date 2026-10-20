import { beforeEach, describe, expect, it, vi } from 'vitest';
import { messageSubmitted } from './messagesSlice.ts';
import { closedRoom, joinedRoom } from '../chatrooms/roomMembershipSlice.ts';

const { sockets, io, toastError } = vi.hoisted(() => {
  const createFakeSocket = () => {
    const handlers = new Map<string, (payload?: unknown) => void>();

    const socket = {
      connected: false,
      emit: vi.fn(),
      on: vi.fn((event: string, handler: (payload?: unknown) => void) => {
        handlers.set(event, handler);
      }),
      removeAllListeners: vi.fn(),
      disconnect: vi.fn(),
    };

    return {
      socket,
      fire: (event: string, payload?: unknown) => handlers.get(event)?.(payload),
      connect: () => {
        socket.connected = true;
        handlers.get('connect')?.();
      },
      drop: () => {
        socket.connected = false;
        handlers.get('disconnect')?.();
      },
    };
  };

  const sockets: ReturnType<typeof createFakeSocket>[] = [];

  return {
    sockets,
    toastError: vi.fn(),
    io: vi.fn(() => {
      const fake = createFakeSocket();
      sockets.push(fake);
      return fake.socket;
    }),
  };
});

vi.mock('socket.io-client', () => ({ default: io }));
vi.mock('react-hot-toast', () => ({ default: { error: toastError, success: vi.fn() } }));

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const message = (id: string, textChannelId: string) => ({
  id,
  payload: `cipher-${id}`,
  senderId: 'sender-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  textChannelId,
});

const openRoom = async (channelId: string) => {
  const { store } = await import('../../store.ts');
  store.dispatch(joinedRoom(channelId));
  return store;
};

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  sockets.length = 0;
});

describe('joining a room', () => {
  it('opens one socket and waits for it before saying anything', async () => {
    const store = await openRoom('room-1');

    expect(sockets).toHaveLength(1);
    expect(sockets[0].socket.emit).not.toHaveBeenCalled();
    expect(store.getState().messages.channelId).toBe('room-1');
    expect(store.getState().messages.isConnected).toBe(false);
  });

  it('enters the channel once the socket is up', async () => {
    const store = await openRoom('room-1');

    sockets[0].connect();

    expect(sockets[0].socket.emit).toHaveBeenCalledWith('joinChannel', { channelId: 'room-1' });
    expect(store.getState().messages.isConnected).toBe(true);
  });

  it('fills the history the server hands back', async () => {
    const store = await openRoom('room-1');
    sockets[0].connect();

    sockets[0].fire('joinedChannel', { channelId: 'room-1', messages: [message('m1', 'room-1')], hasMore: true });

    expect(store.getState().messages.messages.map((entry) => entry.id)).toEqual(['m1']);
    expect(store.getState().messages.hasMore).toBe(true);
  });
});

describe('what the socket says while the room is open', () => {
  it('adds a message that arrives for the open room', async () => {
    const store = await openRoom('room-1');
    sockets[0].connect();

    sockets[0].fire('newMessage', message('m1', 'room-1'));

    expect(store.getState().messages.messages.map((entry) => entry.id)).toEqual(['m1']);
  });

  it('turns a refused membership into one rejoin attempt instead of a toast', async () => {
    const store = await openRoom('room-1');
    sockets[0].connect();

    sockets[0].fire('error', { message: 'Unauthorized', code: 'NOT_IN_CHANNEL' });

    expect(store.getState().roomMembership.joinedChannelId).toBeNull();
    expect(store.getState().roomMembership.rejoinedFor).toBe('room-1');
    expect(toastError).not.toHaveBeenCalled();
  });

  it('shows any other rejection to the user and leaves the room alone', async () => {
    const store = await openRoom('room-1');
    sockets[0].connect();

    sockets[0].fire('error', { message: 'Failed to send message' });
    sockets[0].fire('error', {});

    expect(toastError).toHaveBeenNthCalledWith(1, 'Failed to send message');
    expect(toastError).toHaveBeenNthCalledWith(2, 'The chat server rejected that action.');
    expect(store.getState().roomMembership.joinedChannelId).toBe('room-1');
  });

  it('keeps a failed connection where the banner can show it', async () => {
    const store = await openRoom('room-1');

    sockets[0].fire('connect_error', new Error('xhr poll error'));

    expect(store.getState().messages.error).toBe('xhr poll error');
    expect(store.getState().messages.isConnected).toBe(false);

    sockets[0].fire('connect_error', new Error(''));

    expect(store.getState().messages.error).toBe('Cannot reach the chat server');
  });

  it('notices a socket that drops on its own', async () => {
    const store = await openRoom('room-1');
    sockets[0].connect();

    sockets[0].drop();

    expect(store.getState().messages.isConnected).toBe(false);
  });
});

describe('leaving a room', () => {
  it('closes the previous socket when another room is joined', async () => {
    const store = await openRoom('room-1');
    sockets[0].connect();

    store.dispatch(joinedRoom('room-2'));
    await flush();

    expect(sockets).toHaveLength(2);
    expect(sockets[0].socket.emit).toHaveBeenCalledWith('leaveChannel', { channelId: 'room-1' });
    expect(sockets[0].socket.removeAllListeners).toHaveBeenCalled();
    expect(sockets[0].socket.disconnect).toHaveBeenCalled();
    expect(store.getState().messages.channelId).toBe('room-2');
  });

  it('leaves no socket behind when the same room is joined again', async () => {
    const store = await openRoom('room-1');
    sockets[0].connect();

    store.dispatch(joinedRoom('room-1'));
    await flush();

    expect(sockets).toHaveLength(2);
    expect(sockets[0].socket.disconnect).toHaveBeenCalled();
    expect(sockets[1].socket.disconnect).not.toHaveBeenCalled();
  });

  it('says goodbye only over a socket that is still connected', async () => {
    const store = await openRoom('room-1');

    store.dispatch(closedRoom());
    await flush();

    expect(sockets[0].socket.emit).not.toHaveBeenCalled();
    expect(sockets[0].socket.disconnect).toHaveBeenCalled();
    expect(store.getState().messages.isConnected).toBe(false);
  });
});

describe('sending a message', () => {
  const outgoing = { channelId: 'room-1', payload: 'cipher-out', senderId: 'sender-1' };

  it('goes out over the socket of the room that is open', async () => {
    const store = await openRoom('room-1');
    sockets[0].connect();

    store.dispatch(messageSubmitted(outgoing));

    expect(sockets[0].socket.emit).toHaveBeenCalledWith('sendMessage', outgoing);
  });

  it('has nowhere to go once the room is closed', async () => {
    const store = await openRoom('room-1');
    sockets[0].connect();
    store.dispatch(closedRoom());
    await flush();

    store.dispatch(messageSubmitted(outgoing));

    expect(sockets[0].socket.emit).not.toHaveBeenCalledWith('sendMessage', outgoing);
  });
});
