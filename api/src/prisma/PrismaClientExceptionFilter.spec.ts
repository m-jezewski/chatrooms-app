import { ArgumentsHost, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaExceptionFilter } from './PrismaClientExceptionFilter';

describe('PrismaExceptionFilter', () => {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const filter = new PrismaExceptionFilter();

  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url: '/textChannels/not-a-uuid' }),
    }),
  } as unknown as ArgumentsHost;

  const knownRequestError = (code: string, meta?: Record<string, unknown>) =>
    new Prisma.PrismaClientKnownRequestError('Inconsistent column data: not a uuid', {
      code,
      clientVersion: '6.19.2',
      meta,
    });

  const answer = () => json.mock.calls[0][0];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  it('answers 409 when a unique column is taken', () => {
    filter.catch(knownRequestError('P2002', { target: ['email'] }), host);

    expect(status).toHaveBeenCalledWith(409);
    expect(answer().message).toContain('email');
  });

  it('answers 404 when the row the query needed is not there', () => {
    filter.catch(knownRequestError('P2025'), host);

    expect(status).toHaveBeenCalledWith(404);
    expect(answer().message).toBe('Record not found');
  });

  it('says nothing about the database when the error is not one it knows', () => {
    const notKnownToTheFilter = new Prisma.PrismaClientValidationError('invalid invocation', {
      clientVersion: '6.19.2',
    }) as unknown as Prisma.PrismaClientKnownRequestError;

    filter.catch(notKnownToTheFilter, host);

    expect(status).toHaveBeenCalledWith(500);
    expect(answer().message).toBe('An unexpected error occurred');
    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  it('hands the raw Prisma message to the client for an unmapped code (review 1.12)', () => {
    filter.catch(knownRequestError('P2023'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(answer().message).toContain('Inconsistent column data');
    expect(Logger.prototype.error).not.toHaveBeenCalled();
  });

  it('puts the path and a timestamp in every answer', () => {
    filter.catch(knownRequestError('P2025'), host);

    expect(answer()).toMatchObject({ statusCode: 404, path: '/textChannels/not-a-uuid' });
    expect(Date.parse(answer().timestamp)).not.toBeNaN();
  });
});
