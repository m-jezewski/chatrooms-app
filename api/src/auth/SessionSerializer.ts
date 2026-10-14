import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserProfile } from '../users/dto/user-crud.dto';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: UserProfile, done: (err: Error, userId?: any) => void): void {
    done(null, user.id);
  }

  async deserializeUser(userId: string, done: (err: Error, user: UserProfile | null) => void): Promise<void> {
    try {
      const user = await this.usersService.getUser({ userId: userId });
      done(null, user || null);
    } catch (error) {
      done(error, null);
    }
  }
}
