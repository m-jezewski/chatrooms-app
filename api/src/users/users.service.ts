import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { getHashedPassword } from '../utils/bcrypt';
import { CreateUserDto } from './dto/user-crud.dto';
import { EmailInUseError } from '../utils/customExceptions';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUser(params: { userId: string }): Promise<User> {
    const { userId } = params;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findUserByEmail(params: { email: string }): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: params.email } });
  }

  async createUser(params: CreateUserDto): Promise<User> {
    const { password, name, email } = params;

    try {
      return await this.prisma.user.create({
        data: {
          name: name,
          email: email,
          password: getHashedPassword(password),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new EmailInUseError();
      }
      throw error;
    }
  }

  async deleteOwnAccount(userId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.textChannel.deleteMany({ where: { ownerId: userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }
}
