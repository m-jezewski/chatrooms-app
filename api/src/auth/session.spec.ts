import { INestApplication, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../../test/createTestApp';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionSerializer } from './SessionSerializer';
import { UsersService } from '../users/users.service';
import { UserProfile } from '../users/dto/user-crud.dto';

describe('session without a logged in user', () => {
  const logout = jest.fn();
  const service = { logout } as unknown as AuthService;

  const profile = {
    id: 'user-1',
    name: 'Maciej',
    email: 'user@example.com',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    password: 'hashed',
  } as UserProfile & { password: string };

  let app: INestApplication;

  const startApp = async (user?: typeof profile) => {
    app = await createTestApp({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
      user,
    });

    return request(app.getHttpServer());
  };

  beforeEach(() => {
    jest.clearAllMocks();
    logout.mockResolvedValue({ message: 'User logged out' });
  });

  afterEach(async () => {
    await app?.close();
  });

  it('turns away a caller with no session at all', async () => {
    const client = await startApp();

    await client.get('/auth/status').expect(401);
    await client.delete('/auth/logout').expect(401);

    expect(logout).not.toHaveBeenCalled();
  });

  it('answers a logged in caller without ever sending the password hash', async () => {
    const client = await startApp(profile);
    const response = await client.get('/auth/status').expect(200);

    expect(response.body).toMatchObject({ id: 'user-1', email: 'user@example.com', name: 'Maciej' });
    expect(response.body).not.toHaveProperty('password');
  });
});

describe('SessionSerializer', () => {
  const getUser = jest.fn();
  const users = { getUser } as unknown as UsersService;
  const serializer = new SessionSerializer(users);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps only the user id in the session', () => {
    const done = jest.fn();

    serializer.serializeUser({ id: 'user-1' } as UserProfile, done);

    expect(done).toHaveBeenCalledWith(null, 'user-1');
  });

  it('loads the user behind the session id on every request', async () => {
    const user = { id: 'user-1' } as UserProfile;
    getUser.mockResolvedValue(user);
    const done = jest.fn();

    await serializer.deserializeUser('user-1', done);

    expect(getUser).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(done).toHaveBeenCalledWith(null, user);
  });

  it('hands passport an error when the account behind the cookie is gone', async () => {
    getUser.mockRejectedValue(new NotFoundException('User not found'));
    const done = jest.fn();

    await serializer.deserializeUser('deleted-user', done);

    expect(done).toHaveBeenCalledWith(expect.any(NotFoundException), null);
  });
});
