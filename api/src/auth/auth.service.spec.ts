import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { getHashedPassword } from '../utils/bcrypt';

describe('AuthService', () => {
  const findUserByEmail = jest.fn();
  const users = { findUserByEmail } as unknown as UsersService;
  const service = new AuthService(users);

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
      login: (_user: unknown, done: (error?: unknown) => void) => done(),
      logout: (done: (error?: unknown) => void) => done(),
      ...overrides,
    }) as unknown as Request;

  beforeEach(() => {
    jest.clearAllMocks();
    findUserByEmail.mockResolvedValue(stored);
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
      const login = jest.fn((_user: unknown, done: (error?: unknown) => void) => done());

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

    it('fails loudly when the session cannot be started', async () => {
      const request = fakeRequest({
        login: (_user: unknown, done: (error?: unknown) => void) => done(new Error('store is down')),
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
