import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { TextChannelsService } from './textChannels.service';
import { SessionGuard } from '../auth/guards/session-guard';
import { User } from '@prisma/client';
import {
  CreateTextChannelDto,
  JoinTextChannelDto,
  TextChannelPublicDto,
  UpdateChannelUsersDto,
  UpdateTextChannelDto,
} from './dto/textChannels-crud.dto';
import { Request } from 'express';

@ApiTags('Text Channels')
@Controller('textChannels')
export class TextChannelsController {
  constructor(private readonly textChannelsService: TextChannelsService) {}

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getAllTextChannels(@Req() req: Request): Promise<TextChannelPublicDto[]> {
    const user = req.user as User;

    return this.textChannelsService.findChannelsByUser({
      user,
      findParams: {},
    });
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getTextChannelById(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as User;

    return this.textChannelsService.getChannel({ channelId: id, user: user });
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('create')
  async create(@Body() textChannel: CreateTextChannelDto, @Req() req: Request) {
    const user = req.user as User;

    const channel = await this.textChannelsService.createTextChannel({ textChannel, user });
    req.session.joinedChannels = [...(req.session.joinedChannels ?? []), channel.id];
    return channel;
  }

  @UseGuards(SessionGuard, ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @Post(':id/join')
  async join(@Param('id') id: string, @Body() { authKey }: JoinTextChannelDto, @Req() req: Request) {
    await this.textChannelsService.verifyChannelAuthKey({ channelId: id, authKey });

    const joinedChannels = req.session.joinedChannels ?? [];
    if (!joinedChannels.includes(id)) {
      req.session.joinedChannels = [...joinedChannels, id];
    }
    return { joined: true };
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  async updateChannelUsers(@Param('id') id: string, @Body() { users }: UpdateChannelUsersDto, @Req() req: Request) {
    const user = req.user as User;

    return this.textChannelsService.updateUsersInChannel({
      userIds: users,
      user: user,
      channelId: id,
    });
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put(':id')
  async updateTextChannel(@Param('id') id: string, @Body() data: UpdateTextChannelDto, @Req() req: Request) {
    const user = req.user as User;

    return this.textChannelsService.updateTextChannel({
      channelId: id,
      textChannel: data,
      user,
    });
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  async deleteTextChannel(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as User;

    return this.textChannelsService.deleteTextChannel({
      channelId: id,
      user: user,
    });
  }
}
