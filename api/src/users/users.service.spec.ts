import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailInUseError } from '../utils/customExceptions';

describe('UsersService', () => {
  const create = jest.fn();
  const findUnique = jest.fn();
  const prisma = { user: { create, findUnique } } as unknown as PrismaService;
  const service = new UsersService(prisma);

  const newUser = { name: 'Maciej', email: 'user@example.com', password: 'correct horse battery staple' };

  const knownRequestError = (code: string) =>
    new Prisma.PrismaClientKnownRequestError('failed', { code, clientVersion: '6.19.2' });

  beforeEach(() => {
    jest.clearAllMocks();
    create.mockResolvedValue({ id: 'user-1', name: newUser.name, email: newUser.email });
  });

  describe('createUser', () => {
    it('stores a hash instead of the password it was given', async () => {
      await service.createUser(newUser);

      const { data } = create.mock.calls[0][0];
      expect(data.password).not.toBe(newUser.password);
      expect(bcrypt.compareSync(newUser.password, data.password)).toBe(true);
    });

    it('never reads the password back out of the database', async () => {
      await service.createUser(newUser);

      expect(create.mock.calls[0][0].omit).toEqual({ password: true });
    });

    it('turns a taken email into an error the controller can map to 409', async () => {
      create.mockRejectedValue(knownRequestError('P2002'));

      await expect(service.createUser(newUser)).rejects.toBeInstanceOf(EmailInUseError);
    });

    it('does not dress up an unrelated database failure as a taken email', async () => {
      create.mockRejectedValue(knownRequestError('P2003'));

      await expect(service.createUser(newUser)).rejects.not.toBeInstanceOf(EmailInUseError);
    });
  });

  describe('getUser', () => {
    it('asks for the user without the password column', async () => {
      findUnique.mockResolvedValue({ id: 'user-1' });

      await service.getUser({ userId: 'user-1' });

      expect(findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' }, omit: { password: true } });
    });

    it('says plainly when there is no such user', async () => {
      findUnique.mockResolvedValue(null);

      await expect(service.getUser({ userId: 'nobody' })).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
