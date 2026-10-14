import { Controller, Delete, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SessionGuard } from '../auth/guards/session-guard';
import { UserProfile } from './dto/user-crud.dto';
import { Request } from 'express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(SessionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('me')
  async deleteOwnAccount(@Req() req: Request): Promise<void> {
    const { id } = req.user as UserProfile;
    await this.usersService.deleteOwnAccount(id);

    await new Promise<void>((resolve, reject) => {
      req.session.destroy((error) => (error ? reject(error) : resolve()));
    });
  }
}
