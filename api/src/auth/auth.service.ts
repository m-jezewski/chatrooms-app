import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { comparePasswords } from '../utils/bcrypt';
import { UserProfile } from '../users/dto/user-crud.dto';
import { Request } from 'express';
import { TextChannelsService } from '../textChannels/textChannels.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private readonly textChannelsService: TextChannelsService,
  ) {}

  async login(email: string, password: string, req: Request): Promise<UserProfile> {
    const user = req.isAuthenticated() ? (req.user as UserProfile) : await this.startSession(email, password, req);

    await this.carryJoinedRooms(req, user.id);
    return user;
  }

  private async startSession(email: string, password: string, req: Request): Promise<UserProfile> {
    const validatedUser = await this.validateUser(email, password);
    if (!validatedUser) {
      throw new UnauthorizedException();
    }

    return new Promise((resolve, reject) => {
      req.login(validatedUser, { session: true, keepSessionInfo: true }, (err) => {
        if (err) {
          return reject(new UnauthorizedException(err.message));
        }
        resolve(validatedUser);
      });
    });
  }

  private async carryJoinedRooms(req: Request, userId: string): Promise<void> {
    try {
      await this.textChannelsService.rememberRooms({ userId, roomIds: req.session?.joinedChannels ?? [] });
    } catch (error) {
      this.logger.error(
        'Failed to carry joined rooms over to the account',
        error instanceof Error ? error.stack : error,
      );
    }
  }

  async register(email: string, password: string, name: string): Promise<UserProfile> {
    return await this.usersService.createUser({ name, email, password });
  }

  async validateUser(email: string, password: string): Promise<UserProfile | null> {
    const user = await this.usersService.findUserByEmail({ email });
    if (!user || !comparePasswords(password, user.password)) {
      return null;
    }

    const { password: _hash, ...profile } = user;
    return profile;
  }

  async logout(req: Request): Promise<{ message: string }> {
    return new Promise((res, rej) => {
      req.logout((err) => {
        if (err) {
          return rej(new UnauthorizedException(err.message));
        }
        res({ message: 'User logged out' });
      });
    });
  }
}
