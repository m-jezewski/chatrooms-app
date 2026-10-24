import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { createHash } from 'crypto';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesGateway } from '../messages/MessagesGateway';
import { TextChannelsService } from './textChannels.service';
import { ANONYMOUS_TTL_MAX_MS } from './room-expiry';

const HOUR_MS = 60 * 60 * 1000;

describe('TextChannelsService expiry', () => {
  const findUnique = jest.fn();
  const create = jest.fn();
  const update = jest.fn();
  const prisma = { textChannel: { findUnique, create, update } } as unknown as PrismaService;
  const user = { id: 'user-1' } as User;
  let service: TextChannelsService;

  const newRoom = { name: 'room', salt: 'c2FsdA==', authKey: 'key' };

  beforeEach(() => {
    jest.clearAllMocks();
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue({ id: 'room-1' });
    update.mockResolvedValue({ id: 'room-1' });
    service = new TextChannelsService(prisma, { closeChannel: jest.fn() } as unknown as MessagesGateway);
  });

  const createdExpiry = () => create.mock.calls[0][0].data.expiresAt;

  it('counts the lifetime from the server clock, not from a client-sent date', async () => {
    const before = Date.now();

    await service.createTextChannel({ textChannel: { ...newRoom, ttlMs: HOUR_MS } });

    const expiresAt = createdExpiry();
    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + HOUR_MS);
    expect(expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + HOUR_MS);
  });

  it('accepts the longest option an anonymous creator can pick', async () => {
    await service.createTextChannel({ textChannel: { ...newRoom, ttlMs: ANONYMOUS_TTL_MAX_MS } });

    expect(createdExpiry()).toBeInstanceOf(Date);
  });

  it('rejects an anonymous room that would outlive the cap', async () => {
    const tooLong = service.createTextChannel({ textChannel: { ...newRoom, ttlMs: ANONYMOUS_TTL_MAX_MS + 1 } });

    await expect(tooLong).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects an anonymous room with no lifetime at all', async () => {
    await expect(service.createTextChannel({ textChannel: newRoom })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.createTextChannel({ textChannel: { ...newRoom, ttlMs: null } })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('lets a logged-in owner keep a room forever', async () => {
    await service.createTextChannel({ textChannel: { ...newRoom, ttlMs: null }, user });

    expect(createdExpiry()).toBeNull();
  });

  describe('update', () => {
    const ownerToken = 'owner-token';
    const accountOwned = { id: 'room-1', ownerId: user.id, ownerTokenHash: null };
    const anonymous = {
      id: 'room-1',
      ownerId: null,
      ownerTokenHash: createHash('sha256').update(ownerToken).digest('hex'),
    };
    const ctx = { user };

    const updatedData = () => update.mock.calls[0][0].data;

    it('leaves the current expiry alone when the field is absent', async () => {
      findUnique.mockResolvedValue(accountOwned);

      await service.updateTextChannel({ channelId: 'room-1', ctx, textChannel: { name: 'renamed' } });

      expect(updatedData()).not.toHaveProperty('expiresAt');
    });

    it('restarts the countdown from now', async () => {
      findUnique.mockResolvedValue(accountOwned);
      const before = Date.now();

      await service.updateTextChannel({ channelId: 'room-1', ctx, textChannel: { ttlMs: HOUR_MS } });

      const { expiresAt } = updatedData();
      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + HOUR_MS);
      expect(expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + HOUR_MS);
    });

    it('clears the expiry for an account-owned room', async () => {
      findUnique.mockResolvedValue(accountOwned);

      await service.updateTextChannel({ channelId: 'room-1', ctx, textChannel: { ttlMs: null } });

      expect(updatedData().expiresAt).toBeNull();
    });

    it('refuses to make an anonymous room permanent', async () => {
      findUnique.mockResolvedValue(anonymous);

      const permanent = service.updateTextChannel({
        channelId: 'room-1',
        ctx: { ownerToken },
        textChannel: { ttlMs: null },
      });

      await expect(permanent).rejects.toBeInstanceOf(BadRequestException);
      expect(update).not.toHaveBeenCalled();
    });
  });
});

describe('TextChannelsService delete', () => {
  const findUnique = jest.fn();
  const remove = jest.fn();
  const closeChannel = jest.fn();
  const prisma = { textChannel: { findUnique, delete: remove } } as unknown as PrismaService;
  const gateway = { closeChannel } as unknown as MessagesGateway;
  const owner = { id: 'user-1' } as User;
  let service: TextChannelsService;

  beforeEach(() => {
    jest.clearAllMocks();
    findUnique.mockResolvedValue({ id: 'room-1', ownerId: owner.id, ownerTokenHash: null });
    remove.mockResolvedValue({ id: 'room-1' });
    service = new TextChannelsService(prisma, gateway);
  });

  it('pushes everyone out of the channel it just deleted', async () => {
    await service.deleteTextChannel({ channelId: 'room-1', ctx: { user: owner } });

    expect(remove).toHaveBeenCalled();
    expect(closeChannel).toHaveBeenCalledWith('room-1');
  });

  it('touches nothing when the caller does not own the room', async () => {
    const attempt = service.deleteTextChannel({ channelId: 'room-1', ctx: { user: { id: 'someone-else' } as User } });

    await expect(attempt).rejects.toBeInstanceOf(ForbiddenException);
    expect(remove).not.toHaveBeenCalled();
    expect(closeChannel).not.toHaveBeenCalled();
  });

  it('says nothing when the delete itself failed', async () => {
    remove.mockRejectedValue(new Error('row vanished'));

    await expect(service.deleteTextChannel({ channelId: 'room-1', ctx: { user: owner } })).rejects.toThrow();
    expect(closeChannel).not.toHaveBeenCalled();
  });

  it('accepts the owner token of an anonymous room', async () => {
    const ownerToken = 'the-real-token';
    findUnique.mockResolvedValue({
      id: 'room-1',
      ownerId: null,
      ownerTokenHash: createHash('sha256').update(ownerToken).digest('hex'),
    });

    await service.deleteTextChannel({ channelId: 'room-1', ctx: { ownerToken } });
    expect(remove).toHaveBeenCalled();
  });

  it('refuses a wrong owner token', async () => {
    findUnique.mockResolvedValue({
      id: 'room-1',
      ownerId: null,
      ownerTokenHash: createHash('sha256').update('the-real-token').digest('hex'),
    });

    const attempt = service.deleteTextChannel({ channelId: 'room-1', ctx: { ownerToken: 'a-guess' } });

    await expect(attempt).rejects.toBeInstanceOf(ForbiddenException);
    expect(remove).not.toHaveBeenCalled();
  });

  it('refuses rather than crashes when the stored token hash is malformed', async () => {
    findUnique.mockResolvedValue({ id: 'room-1', ownerId: null, ownerTokenHash: 'not-a-hash' });

    const attempt = service.deleteTextChannel({ channelId: 'room-1', ctx: { ownerToken: 'the-real-token' } });

    await expect(attempt).rejects.toBeInstanceOf(ForbiddenException);
    expect(remove).not.toHaveBeenCalled();
  });
});

describe('TextChannelsService invite codes', () => {
  const findUnique = jest.fn();
  const update = jest.fn();
  const prisma = { textChannel: { findUnique, update } } as unknown as PrismaService;
  const service = new TextChannelsService(prisma, { closeChannel: jest.fn() } as unknown as MessagesGateway);

  const owner = { id: 'user-1' } as User;
  const room = { id: 'room-1', ownerId: owner.id, ownerTokenHash: null };
  const ctx = { user: owner };

  const codeLookups = () => findUnique.mock.calls.filter(([query]) => 'inviteCode' in query.where);
  const rotatedCodes = () => update.mock.calls.map(([query]) => query.data.inviteCode as string);

  const takenCodes = (times: number) => {
    let seen = 0;
    findUnique.mockImplementation(({ where }) => {
      if (!('inviteCode' in where)) return Promise.resolve(room);
      seen += 1;
      return Promise.resolve(seen <= times ? { id: 'other-room' } : null);
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    takenCodes(0);
    update.mockResolvedValue(room);
  });

  it('builds codes of eight characters that are hard to misread', async () => {
    for (let rotation = 0; rotation < 25; rotation++) {
      await service.rotateInviteCode({ channelId: 'room-1', ctx });
    }

    const codes = rotatedCodes();
    expect(codes).toHaveLength(25);
    expect(codes.every((code) => code.length === 8)).toBe(true);
    expect(codes.join('')).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
  });

  it('draws again when the code it rolled is already taken', async () => {
    takenCodes(2);

    await service.rotateInviteCode({ channelId: 'room-1', ctx });

    expect(codeLookups()).toHaveLength(3);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('gives up instead of looping forever when every draw collides', async () => {
    takenCodes(Number.POSITIVE_INFINITY);

    await expect(service.rotateInviteCode({ channelId: 'room-1', ctx })).rejects.toThrow(
      'Could not generate a unique invite code',
    );
    expect(codeLookups()).toHaveLength(5);
    expect(update).not.toHaveBeenCalled();
  });
});
