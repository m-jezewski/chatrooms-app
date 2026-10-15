import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomExpiryService } from './roomExpiry.service';

describe('RoomExpiryService', () => {
  const deleteMany = jest.fn();
  const prisma = { textChannel: { deleteMany } } as unknown as PrismaService;
  let service: RoomExpiryService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    service = new RoomExpiryService(prisma);
  });

  it('deletes rooms whose expiry already passed and nothing else', async () => {
    deleteMany.mockResolvedValue({ count: 0 });
    const before = Date.now();

    await service.sweepExpiredRooms();

    expect(deleteMany).toHaveBeenCalledTimes(1);
    const [query] = deleteMany.mock.calls[0];
    expect(Object.keys(query.where)).toEqual(['expiresAt']);
    expect(Object.keys(query.where.expiresAt)).toEqual(['lt']);
    expect(query.where.expiresAt.lt.getTime()).toBeGreaterThanOrEqual(before);
    expect(query.where.expiresAt.lt.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('logs only when something was deleted', async () => {
    deleteMany.mockResolvedValue({ count: 0 });
    await service.sweepExpiredRooms();
    expect(Logger.prototype.log).not.toHaveBeenCalled();

    deleteMany.mockResolvedValue({ count: 3 });
    await service.sweepExpiredRooms();
    expect(Logger.prototype.log).toHaveBeenCalledWith('Swept 3 expired room(s)');
  });

  it('keeps the schedule alive when a tick fails', async () => {
    deleteMany.mockRejectedValue(new Error('database is down'));

    await expect(service.sweepExpiredRooms()).resolves.toBeUndefined();
    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  it('sweeps once on bootstrap instead of waiting for the first tick', async () => {
    deleteMany.mockResolvedValue({ count: 1 });

    await service.onApplicationBootstrap();

    expect(deleteMany).toHaveBeenCalledTimes(1);
  });
});
