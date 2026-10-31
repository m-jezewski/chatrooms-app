import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../../test/createTestApp';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserProfile } from './dto/user-crud.dto';

describe('deleting your own account', () => {
  const deleteOwnAccount = jest.fn();
  const service = { deleteOwnAccount } as unknown as UsersService;

  const profile = { id: 'user-1', name: 'Maciej', email: 'user@example.com' } as UserProfile;

  let app: INestApplication;

  const startApp = async (user?: UserProfile) => {
    app = await createTestApp({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
      user,
    });

    return request.agent(app.getHttpServer());
  };

  beforeEach(() => {
    jest.clearAllMocks();
    deleteOwnAccount.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await app?.close();
  });

  it('deletes nothing for a caller with no session', async () => {
    const client = await startApp();

    await client.delete('/users/me').expect(401);

    expect(deleteOwnAccount).not.toHaveBeenCalled();
  });

  it('deletes the account of the caller and nobody else', async () => {
    const client = await startApp(profile);

    await client.delete('/users/me').expect(204, {});

    expect(deleteOwnAccount).toHaveBeenCalledTimes(1);
    expect(deleteOwnAccount).toHaveBeenCalledWith('user-1');
  });

  it('answers with the failure instead of pretending the account is gone', async () => {
    deleteOwnAccount.mockRejectedValue(new Error('database is down'));
    const client = await startApp(profile);

    await client.delete('/users/me').expect(500);
  });
});
