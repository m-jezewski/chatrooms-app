import { Server, Socket } from 'socket.io';
import { MessagesGateway, NOT_IN_CHANNEL } from './MessagesGateway';
import { MessagesService } from './messages.service';

describe('MessagesGateway join authorization', () => {
  const getChannelMessagePage = jest.fn();
  const messagesService = { getChannelMessagePage } as unknown as MessagesService;
  let gateway: MessagesGateway;

  const clientWith = (atHandshake: string[], afterReload: string[] | Error) => {
    const handshake: Record<string, unknown> = {};
    const reload = (callback: (error?: unknown) => void) => {
      if (afterReload instanceof Error) {
        return callback(afterReload);
      }
      handshake.session = { joinedChannels: afterReload, reload };
      callback();
    };
    handshake.session = { joinedChannels: atHandshake, reload };

    return { handshake, join: jest.fn(), emit: jest.fn() } as unknown as Socket;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getChannelMessagePage.mockResolvedValue({ messages: [], hasMore: false });
    gateway = new MessagesGateway(messagesService);
  });

  it('lets in a room joined after the socket connected', async () => {
    const client = clientWith([], ['room-1']);

    await gateway.handleJoinChannel({ channelId: 'room-1' }, client);

    expect(client.join).toHaveBeenCalledWith('channel_room-1');
    expect(client.emit).toHaveBeenCalledWith('joinedChannel', { messages: [], hasMore: false, channelId: 'room-1' });
  });

  it('keeps out a room the session never joined', async () => {
    const client = clientWith(['room-1'], ['room-1']);

    await gateway.handleJoinChannel({ channelId: 'room-2' }, client);

    expect(client.join).not.toHaveBeenCalled();
    expect(client.emit).toHaveBeenCalledWith('error', { message: 'Unauthorized', code: NOT_IN_CHANNEL });
  });

  it('keeps out a session that is gone from the store', async () => {
    const client = clientWith(['room-1'], new Error('failed to load session'));

    await gateway.handleJoinChannel({ channelId: 'room-1' }, client);

    expect(client.join).not.toHaveBeenCalled();
    expect(client.emit).toHaveBeenCalledWith('error', { message: 'Unauthorized', code: NOT_IN_CHANNEL });
  });
});

describe('MessagesGateway closeChannel', () => {
  const emit = jest.fn();
  const socketsLeave = jest.fn();
  let gateway: MessagesGateway;

  beforeEach(() => {
    jest.clearAllMocks();
    gateway = new MessagesGateway({} as unknown as MessagesService);
    gateway.server = {
      to: jest.fn().mockReturnValue({ emit }),
      in: jest.fn().mockReturnValue({ socketsLeave }),
    } as unknown as Server;
  });

  it('tells the room it is gone and then empties it', () => {
    gateway.closeChannel('room-1');

    expect(gateway.server.to).toHaveBeenCalledWith('channel_room-1');
    expect(emit).toHaveBeenCalledWith('roomClosed', { channelId: 'room-1' });
    expect(gateway.server.in).toHaveBeenCalledWith('channel_room-1');
    expect(socketsLeave).toHaveBeenCalledWith('channel_room-1');
  });
});

describe('MessagesGateway sending and leaving', () => {
  const createMessage = jest.fn();
  const messagesService = { createMessage } as unknown as MessagesService;
  const broadcast = jest.fn();
  let gateway: MessagesGateway;

  const clientInRooms = (...rooms: string[]) =>
    ({ rooms: new Set(rooms), emit: jest.fn(), leave: jest.fn() }) as unknown as Socket;

  const outgoing = { channelId: 'room-1', payload: 'cipher', senderId: 'sender-1' };

  beforeEach(() => {
    jest.clearAllMocks();
    createMessage.mockResolvedValue({ id: 'message-1', ...outgoing });
    gateway = new MessagesGateway(messagesService);
    gateway.server = { to: jest.fn().mockReturnValue({ emit: broadcast }) } as unknown as Server;
  });

  it('refuses a message for a channel the socket never entered', async () => {
    const client = clientInRooms('channel_room-2');

    await gateway.handleSendMessage(outgoing, client);

    expect(createMessage).not.toHaveBeenCalled();
    expect(client.emit).toHaveBeenCalledWith('error', { message: 'Access denied' });
  });

  it('hands a stored message to everyone in the channel', async () => {
    const client = clientInRooms('channel_room-1');

    await gateway.handleSendMessage(outgoing, client);

    expect(createMessage).toHaveBeenCalledWith(outgoing);
    expect(gateway.server.to).toHaveBeenCalledWith('channel_room-1');
    expect(broadcast).toHaveBeenCalledWith('newMessage', { id: 'message-1', ...outgoing });
  });

  it('tells only the sender when the message could not be stored', async () => {
    createMessage.mockRejectedValue(new Error('database is down'));
    const client = clientInRooms('channel_room-1');

    await gateway.handleSendMessage(outgoing, client);

    expect(broadcast).not.toHaveBeenCalled();
    expect(client.emit).toHaveBeenCalledWith('error', { message: 'Failed to send message' });
  });

  it('takes the socket out of the channel it asked to leave', () => {
    const client = clientInRooms('channel_room-1');

    gateway.handleLeaveChannel({ channelId: 'room-1' }, client);

    expect(client.leave).toHaveBeenCalledWith('channel_room-1');
    expect(client.emit).toHaveBeenCalledWith('leftChannel', { message: 'Left channel room-1' });
  });
});
