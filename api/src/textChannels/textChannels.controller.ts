import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { TextChannelsService, ManageContext } from './textChannels.service';
import { SessionGuard } from '../auth/guards/session-guard';
import { User } from '@prisma/client';
import { CreateTextChannelDto, JoinTextChannelDto, SaveRoomDto, UpdateTextChannelDto } from './dto/textChannels-crud.dto';
import { Request } from 'express';

function manageContext(req: Request): ManageContext {
  const ownerToken = req.header('x-owner-token');
  return { user: req.user as User | undefined, ownerToken };
}

@ApiTags('Text Channels')
@Controller('textChannels')
export class TextChannelsController {
  constructor(private readonly textChannelsService: TextChannelsService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Get('code/:inviteCode')
  async getRoomByInviteCode(@Param('inviteCode') inviteCode: string) {
    return this.textChannelsService.getRoomByInviteCode(inviteCode);
  }

  @UseGuards(SessionGuard)
  @Get('saved')
  async getSavedRooms(@Req() req: Request) {
    const user = req.user as User;
    return this.textChannelsService.getSavedRooms(user.id);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getTextChannelById(@Param('id') id: string) {
    return this.textChannelsService.getChannel({ channelId: id });
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 3600_000 } })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create(@Body() textChannel: CreateTextChannelDto, @Req() req: Request) {
    const user = req.user as User | undefined;

    const channel = await this.textChannelsService.createTextChannel({ textChannel, user });
    req.session.joinedChannels = [...(req.session.joinedChannels ?? []), channel.id];
    return channel;
  }

  @UseGuards(ThrottlerGuard)
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
  @HttpCode(HttpStatus.OK)
  @Post(':id/save')
  async saveRoom(@Param('id') id: string, @Body() { name }: SaveRoomDto, @Req() req: Request) {
    const user = req.user as User;
    return this.textChannelsService.saveRoom({ userId: user.id, roomId: id, name });
  }

  @UseGuards(SessionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id/save')
  async unsaveRoom(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as User;
    await this.textChannelsService.unsaveRoom({ userId: user.id, roomId: id });
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/rotate-code')
  async rotateInviteCode(@Param('id') id: string, @Req() req: Request) {
    return this.textChannelsService.rotateInviteCode({ channelId: id, ctx: manageContext(req) });
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put(':id')
  async updateTextChannel(@Param('id') id: string, @Body() data: UpdateTextChannelDto, @Req() req: Request) {
    return this.textChannelsService.updateTextChannel({
      channelId: id,
      textChannel: data,
      ctx: manageContext(req),
    });
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  async deleteTextChannel(@Param('id') id: string, @Req() req: Request) {
    return this.textChannelsService.deleteTextChannel({
      channelId: id,
      ctx: manageContext(req),
    });
  }
}
