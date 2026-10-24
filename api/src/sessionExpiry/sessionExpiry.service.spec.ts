import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionExpiryService } from './sessionExpiry.service';

describe('SessionExpiryService', () => {
  const deleteMany = jest.fn();
  const prisma = { session: { deleteMany } } as unknown as PrismaService;
  let service: SessionExpiryService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    deleteMany.mockResolvedValue({ count: 1 });
    service = new SessionExpiryService(prisma);
  });

  it('deletes sessions whose expiry already passed and nothing else', async () => {
    const before = Date.now();

    await service.sweepExpiredSessions();

    expect(deleteMany).toHaveBeenCalledTimes(1);
    const [query] = deleteMany.mock.calls[0];
    expect(Object.keys(query.where)).toEqual(['expire']);
    expect(Object.keys(query.where.expire)).toEqual(['lt']);
    expect(query.where.expire.lt.getTime()).toBeGreaterThanOrEqual(before);
    expect(query.where.expire.lt.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('says nothing when nothing expired', async () => {
    deleteMany.mockResolvedValue({ count: 0 });

    await service.sweepExpiredSessions();

    expect(Logger.prototype.log).not.toHaveBeenCalled();
  });

  it('logs what it deleted', async () => {
    deleteMany.mockResolvedValue({ count: 4 });

    await service.sweepExpiredSessions();

    expect(Logger.prototype.log).toHaveBeenCalledWith('Swept 4 expired session(s)');
  });

  it('keeps the schedule alive when a tick fails', async () => {
    deleteMany.mockRejectedValue(new Error('database is down'));

    await expect(service.sweepExpiredSessions()).resolves.toBeUndefined();
    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  it('sweeps once on bootstrap instead of waiting for the first tick', async () => {
    await service.onApplicationBootstrap();

    expect(deleteMany).toHaveBeenCalledTimes(1);
  });
});
