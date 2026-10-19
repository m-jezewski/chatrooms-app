import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesGateway } from '../messages/MessagesGateway';
import { RoomExpiryService } from './roomExpiry.service';

describe('RoomExpiryService', () => {
  const findMany = jest.fn();
  const deleteMany = jest.fn();
  const closeChannel = jest.fn();
  const prisma = { textChannel: { findMany, deleteMany } } as unknown as PrismaService;
  const gateway = { closeChannel } as unknown as MessagesGateway;
  let service: RoomExpiryService;

  const expiredRooms = (...ids: string[]) => findMany.mockResolvedValue(ids.map((id) => ({ id })));

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    expiredRooms('room-1');
    deleteMany.mockResolvedValue({ count: 1 });
    service = new RoomExpiryService(prisma, gateway);
  });

  it('looks for rooms whose expiry already passed and nothing else', async () => {
    const before = Date.now();

    await service.sweepExpiredRooms();

    expect(findMany).toHaveBeenCalledTimes(1);
    const [query] = findMany.mock.calls[0];
    expect(Object.keys(query.where)).toEqual(['expiresAt']);
    expect(Object.keys(query.where.expiresAt)).toEqual(['lt']);
    expect(query.where.expiresAt.lt.getTime()).toBeGreaterThanOrEqual(before);
    expect(query.where.expiresAt.lt.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('deletes exactly the rooms it found, and only while they are still expired', async () => {
    expiredRooms('room-1', 'room-2');
    deleteMany.mockResolvedValue({ count: 2 });

    await service.sweepExpiredRooms();

    const [query] = deleteMany.mock.calls[0];
    expect(query.where.id).toEqual({ in: ['room-1', 'room-2'] });
    expect(query.where.expiresAt.lt).toEqual(findMany.mock.calls[0][0].where.expiresAt.lt);
  });

  it('does not delete anything when nothing expired', async () => {
    expiredRooms();

    await service.sweepExpiredRooms();

    expect(deleteMany).not.toHaveBeenCalled();
    expect(closeChannel).not.toHaveBeenCalled();
    expect(Logger.prototype.log).not.toHaveBeenCalled();
  });

  it('pushes every swept room out of its channel', async () => {
    expiredRooms('room-1', 'room-2');
    deleteMany.mockResolvedValue({ count: 2 });

    await service.sweepExpiredRooms();

    expect(closeChannel).toHaveBeenCalledWith('room-1');
    expect(closeChannel).toHaveBeenCalledWith('room-2');
  });

  it('says nothing when the rows were gone before the delete ran', async () => {
    deleteMany.mockResolvedValue({ count: 0 });

    await service.sweepExpiredRooms();

    expect(closeChannel).not.toHaveBeenCalled();
    expect(Logger.prototype.log).not.toHaveBeenCalled();
  });

  it('logs what it deleted', async () => {
    deleteMany.mockResolvedValue({ count: 3 });

    await service.sweepExpiredRooms();

    expect(Logger.prototype.log).toHaveBeenCalledWith('Swept 3 expired room(s)');
  });

  it('keeps the schedule alive when a tick fails', async () => {
    findMany.mockRejectedValue(new Error('database is down'));

    await expect(service.sweepExpiredRooms()).resolves.toBeUndefined();
    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  it('sweeps once on bootstrap instead of waiting for the first tick', async () => {
    await service.onApplicationBootstrap();

    expect(deleteMany).toHaveBeenCalledTimes(1);
  });
});
