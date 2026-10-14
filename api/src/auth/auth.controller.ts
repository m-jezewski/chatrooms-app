import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterUserDto, UserEntity, UserProfile } from '../users/dto/user-crud.dto';
import { SessionGuard } from './guards/session-guard';
import { EmailInUseError } from '../utils/customExceptions';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth-dto';
import { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request): Promise<UserEntity> {
    const { email, password } = loginDto;
    const loggedUser = await this.authService.login(email, password, req);
    return new UserEntity(loggedUser);
  }

  @SkipThrottle()
  @Get('status')
  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getAuthSession(@Req() req: Request): Promise<UserEntity> {
    return new UserEntity(req.user as UserProfile);
  }

  @UseGuards(SessionGuard)
  @Delete('logout')
  async logout(@Req() req: Request): Promise<{ message: string }> {
    return this.authService.logout(req);
  }

  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register')
  async register(@Body() registerDto: RegisterUserDto, @Req() req: Request): Promise<UserEntity> {
    try {
      const { email, password, name } = registerDto;
      const userDb = await this.authService.register(email, password, name);
      await this.authService.login(registerDto.email, registerDto.password, req);
      return new UserEntity(userDb);
    } catch (error) {
      if (error instanceof EmailInUseError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}
