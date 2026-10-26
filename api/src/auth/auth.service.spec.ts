import { Logger, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { TextChannelsService } from '../textChannels/textChannels.service';
import { getHashedPassword } from '../utils/bcrypt';

describe('AuthService', () => {
  const findUserByEmail = jest.fn();
  const users = { findUserByEmail } as unknown as UsersService;
  const rememberRooms = jest.fn();
  const textChannels = { rememberRooms } as unknown as TextChannelsService;
  const service = new AuthService(users, textChannels);

  const password = 'correct horse battery staple';
  const stored = {
    id: 'user-1',
    name: 'Maciej',
    email: 'user@example.com',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    password: getHashedPassword(password),
  };

  const fakeRequest = (overrides: Record<string, unknown> = {}) =>
    ({
      isAuthenticated: () => false,
      session: { joinedChannels: [] },
      login: (_user: unknown, _options: unknown, done: (error?: unknown) => void) => done(),
      logout: (done: (error?: unknown) => void) => done(),
      ...overrides,
    }) as unknown as Request;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    findUserByEmail.mockResolvedValue(stored);
    rememberRooms.mockResolvedValue(undefined);
  });

  describe('validateUser', () => {
    it('hands back the profile without the password hash', async () => {
      const profile = await service.validateUser(stored.email, password);

      expect(profile).toMatchObject({ id: 'user-1', email: stored.email });
      expect(profile).not.toHaveProperty('password');
    });

    it('refuses a password that does not match the stored hash', async () => {
      expect(await service.validateUser(stored.email, 'not the password')).toBeNull();
    });

    it('refuses an email nobody registered', async () => {
      findUserByEmail.mockResolvedValue(null);

      expect(await service.validateUser('nobody@example.com', password)).toBeNull();
    });
  });

  describe('login', () => {
    it('starts a session for valid credentials', async () => {
      const login = jest.fn((_user: unknown, _options: unknown, done: (error?: unknown) => void) => done());

      const profile = await service.login(stored.email, password, fakeRequest({ login }));

      expect(login).toHaveBeenCalledTimes(1);
      expect(profile).toMatchObject({ id: 'user-1' });
    });

    it('rejects credentials that do not check out before touching the session', async () => {
      const login = jest.fn();
      const attempt = service.login(stored.email, 'wrong', fakeRequest({ login }));

      await expect(attempt).rejects.toBeInstanceOf(UnauthorizedException);
      expect(login).not.toHaveBeenCalled();
    });

    it('does not log in a caller who already has a session', async () => {
      const login = jest.fn();
      const request = fakeRequest({ isAuthenticated: () => true, user: { id: 'user-1' }, login });

      expect(await service.login(stored.email, password, request)).toEqual({ id: 'user-1' });
      expect(login).not.toHaveBeenCalled();
      expect(findUserByEmail).not.toHaveBeenCalled();
    });

    it('keeps the rooms joined before registering', async () => {
      const request = fakeRequest({ session: { joinedChannels: ['room-1', 'room-2'] } }) as any;
      request.login = (_user: unknown, options: any, done: (error?: unknown) => void) => {
        const previous = request.session;
        request.session = {};
        if (options?.keepSessionInfo) {
          Object.assign(request.session, previous);
        }
        done();
      };

      await service.login(stored.email, password, request);

      expect(request.session.joinedChannels).toEqual(['room-1', 'room-2']);
    });

    it('carries the rooms joined before logging in over to the account', async () => {
      const request = fakeRequest({ session: { joinedChannels: ['room-1', 'room-2'] } });

      await service.login(stored.email, password, request);

      expect(rememberRooms).toHaveBeenCalledWith({ userId: 'user-1', roomIds: ['room-1', 'room-2'] });
    });

    it('carries the rooms over for a caller the guard already logged in', async () => {
      const request = fakeRequest({
        isAuthenticated: () => true,
        user: { id: 'user-1' },
        session: { joinedChannels: ['room-1'] },
      });

      await service.login(stored.email, password, request);

      expect(rememberRooms).toHaveBeenCalledWith({ userId: 'user-1', roomIds: ['room-1'] });
    });

    it('logs in even when the rooms cannot be carried over', async () => {
      rememberRooms.mockRejectedValue(new Error('database is down'));
      const request = fakeRequest({ session: { joinedChannels: ['room-1'] } });

      await expect(service.login(stored.email, password, request)).resolves.toMatchObject({ id: 'user-1' });
      expect(Logger.prototype.error).toHaveBeenCalled();
    });

    it('fails loudly when the session cannot be started', async () => {
      const request = fakeRequest({
        login: (_user: unknown, _options: unknown, done: (error?: unknown) => void) => done(new Error('store is down')),
      });

      await expect(service.login(stored.email, password, request)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('reports the session as closed', async () => {
      expect(await service.logout(fakeRequest())).toEqual({ message: 'User logged out' });
    });

    it('fails loudly when the session cannot be closed', async () => {
      const request = fakeRequest({ logout: (done: (error?: unknown) => void) => done(new Error('store is down')) });

      await expect(service.logout(request)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
