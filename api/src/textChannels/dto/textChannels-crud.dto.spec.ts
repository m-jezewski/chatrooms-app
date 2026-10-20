import { ArgumentMetadata, BadRequestException, ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTextChannelDto, UpdateTextChannelDto } from './textChannels-crud.dto';
import { TTL_MAX_MS, TTL_MIN_MS } from '../room-expiry';

const VALID_ROOM = {
  name: 'room name',
  salt: 'MTIzNDU2Nzg5MDEyMzQ1Ng==',
  authKey: 'MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=',
};

const ttlErrors = async (ttlMs: unknown): Promise<string[]> => {
  const errors = await validate(plainToInstance(CreateTextChannelDto, { ...VALID_ROOM, ttlMs }));
  return errors.map((error) => error.property);
};

describe('ttlMs validation', () => {
  it('accepts a lifetime inside the allowed range', async () => {
    await expect(ttlErrors(24 * 60 * 60 * 1000)).resolves.toEqual([]);
    await expect(ttlErrors(TTL_MIN_MS)).resolves.toEqual([]);
    await expect(ttlErrors(TTL_MAX_MS)).resolves.toEqual([]);
  });

  it('accepts null and an absent field as "never"', async () => {
    await expect(ttlErrors(null)).resolves.toEqual([]);

    const errors = await validate(plainToInstance(CreateTextChannelDto, VALID_ROOM));
    expect(errors).toEqual([]);
  });

  it('rejects lifetimes outside the range', async () => {
    await expect(ttlErrors(TTL_MIN_MS - 1)).resolves.toEqual(['ttlMs']);
    await expect(ttlErrors(TTL_MAX_MS + 1)).resolves.toEqual(['ttlMs']);
    await expect(ttlErrors(0)).resolves.toEqual(['ttlMs']);
    await expect(ttlErrors(-60_000)).resolves.toEqual(['ttlMs']);
  });

  it('rejects anything that is not a whole number of milliseconds', async () => {
    await expect(ttlErrors('86400000')).resolves.toEqual(['ttlMs']);
    await expect(ttlErrors(86_400_000.5)).resolves.toEqual(['ttlMs']);
    await expect(ttlErrors(Number.NaN)).resolves.toEqual(['ttlMs']);
  });

  it('keeps the same rules on update', async () => {
    const tooLong = await validate(plainToInstance(UpdateTextChannelDto, { ttlMs: TTL_MAX_MS + 1 }));
    expect(tooLong.map((error) => error.property)).toEqual(['ttlMs']);

    const never = await validate(plainToInstance(UpdateTextChannelDto, { ttlMs: null }));
    expect(never).toEqual([]);
  });
});

describe('ttlMs through the global ValidationPipe', () => {
  const pipe = new ValidationPipe({ whitelist: true });
  const asUpdate: ArgumentMetadata = { type: 'body', metatype: UpdateTextChannelDto };

  it('tells an untouched expiry apart from an expiry set to never', async () => {
    await expect(pipe.transform({ name: 'renamed' }, asUpdate)).resolves.not.toHaveProperty('ttlMs');
    await expect(pipe.transform({ ttlMs: null }, asUpdate)).resolves.toHaveProperty('ttlMs', null);
  });

  it('drops a client-sent expiry date instead of honouring it', async () => {
    const body = await pipe.transform({ name: 'renamed', expiresAt: '2030-01-01T00:00:00.000Z' }, asUpdate);

    expect(body).toEqual({ name: 'renamed' });
  });

  it('answers with 400 for a malformed lifetime', async () => {
    await expect(pipe.transform({ ttlMs: 'tomorrow' }, asUpdate)).rejects.toBeInstanceOf(BadRequestException);
  });
});
