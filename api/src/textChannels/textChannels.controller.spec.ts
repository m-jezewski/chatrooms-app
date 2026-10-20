import { INestApplication, ForbiddenException, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as request from 'supertest';
import { createTestApp } from '../../test/createTestApp';
import { TextChannelsController } from './textChannels.controller';
import { TextChannelsService } from './textChannels.service';

describe('TextChannelsController session bookkeeping', () => {
  const verifyChannelAuthKey = jest.fn();
  const rememberRoom = jest.fn();
  const forgetRoom = jest.fn();
  const getChannel = jest.fn();
  const createTextChannel = jest.fn();

  const service = {
    verifyChannelAuthKey,
    rememberRoom,
    forgetRoom,
    getChannel,
    createTextChannel,
  } as unknown as TextChannelsService;

  const owner = { id: 'user-1' } as User;
  const room = { id: 'room-1', name: 'Alpha' };
  const authKey = `${'A'.repeat(43)}=`;
  const salt = `${'A'.repeat(22)}==`;

  let app: INestApplication;

  const startApp = async (user?: User) => {
    app = await createTestApp({
      controllers: [TextChannelsController],
      providers: [{ provide: TextChannelsService, useValue: service }],
      user,
    });

    return request.agent(app.getHttpServer());
  };

  const joinedChannelsSeenBy = (call: number) => getChannel.mock.calls[call][0].joinedChannels;

  beforeEach(() => {
    jest.clearAllMocks();
    verifyChannelAuthKey.mockResolvedValue(undefined);
    rememberRoom.mockResolvedValue(undefined);
    forgetRoom.mockResolvedValue(undefined);
    getChannel.mockResolvedValue(room);
    createTextChannel.mockResolvedValue(room);
  });

  afterEach(async () => {
    await app?.close();
  });

  it('remembers the room in the session once the password checked out', async () => {
    const client = await startApp();

    await client.post('/textChannels/room-1/join').send({ authKey }).expect(200, { joined: true });
    await client.get('/textChannels/room-1').expect(200);

    expect(verifyChannelAuthKey).toHaveBeenCalledWith({ channelId: 'room-1', authKey });
    expect(joinedChannelsSeenBy(0)).toEqual(['room-1']);
  });

  it('does not let the same room pile up in the session', async () => {
    const client = await startApp();

    await client.post('/textChannels/room-1/join').send({ authKey });
    await client.post('/textChannels/room-1/join').send({ authKey });
    await client.get('/textChannels/room-1').expect(200);

    expect(joinedChannelsSeenBy(0)).toEqual(['room-1']);
  });

  it('refuses to open a room the session never joined', async () => {
    getChannel.mockRejectedValue(new ForbiddenException('Room is locked'));
    const client = await startApp();

    await client.get('/textChannels/room-1').expect(403);

    expect(joinedChannelsSeenBy(0)).toEqual([]);
  });

  it('answers 404 for a room that is gone instead of failing', async () => {
    getChannel.mockRejectedValue(new NotFoundException('Channel not found'));
    const client = await startApp();

    await client.get('/textChannels/room-1').expect(404);
  });

  it('puts a freshly created room in the session of its creator', async () => {
    const client = await startApp();

    await client.post('/textChannels').send({ name: 'Alpha', salt, authKey, ttlMs: 60_000 }).expect(201);
    await client.get('/textChannels/room-1').expect(200);

    expect(joinedChannelsSeenBy(0)).toEqual(['room-1']);
  });

  it('takes only the room it was asked to leave out of the session', async () => {
    const client = await startApp();

    await client.post('/textChannels/room-1/join').send({ authKey });
    await client.post('/textChannels/room-2/join').send({ authKey });
    await client.post('/textChannels/room-1/leave').expect(204);
    await client.get('/textChannels/room-2').expect(200);

    expect(joinedChannelsSeenBy(0)).toEqual(['room-2']);
  });

  it('keeps the room list of an account in step with the session', async () => {
    const client = await startApp(owner);

    await client.post('/textChannels/room-1/join').send({ authKey });
    expect(rememberRoom).toHaveBeenCalledWith({ userId: owner.id, roomId: 'room-1' });

    await client.post('/textChannels/room-1/leave');
    expect(forgetRoom).toHaveBeenCalledWith({ userId: owner.id, roomId: 'room-1' });
  });

  it('leaves the database alone for an anonymous visitor', async () => {
    const client = await startApp();

    await client.post('/textChannels/room-1/join').send({ authKey });
    await client.post('/textChannels/room-1/leave').expect(204);

    expect(rememberRoom).not.toHaveBeenCalled();
    expect(forgetRoom).not.toHaveBeenCalled();
  });

  it('turns away a join without an authKey before touching the service', async () => {
    const client = await startApp();

    await client.post('/textChannels/room-1/join').send({}).expect(400);

    expect(verifyChannelAuthKey).not.toHaveBeenCalled();
  });
});
