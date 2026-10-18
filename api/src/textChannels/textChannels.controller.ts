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
import { Throttle } from '@nestjs/throttler';
import { TextChannelsService, ManageContext } from './textChannels.service';
import { SessionGuard } from '../auth/guards/session-guard';
import { User } from '@prisma/client';
import { CreateTextChannelDto, JoinTextChannelDto, UpdateTextChannelDto } from './dto/textChannels-crud.dto';
import { Request } from 'express';

function manageContext(req: Request): ManageContext {
  const ownerToken = req.header('x-owner-token');
  return { user: req.user as User | undefined, ownerToken };
}

@ApiTags('Text Channels')
@Controller('textChannels')
export class TextChannelsController {
  constructor(private readonly textChannelsService: TextChannelsService) {}

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Get('code/:inviteCode')
  async getRoomEntryByCode(@Param('inviteCode') inviteCode: string) {
    return this.textChannelsService.getRoomEntryByCode(inviteCode);
  }

  @UseGuards(SessionGuard)
  @Get('saved')
  async getSavedRooms(@Req() req: Request) {
    const user = req.user as User;
    return this.textChannelsService.getSavedRooms(user.id);
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Get(':id/entry')
  async getRoomEntry(@Param('id') id: string) {
    return this.textChannelsService.getRoomEntryById(id);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getTextChannelById(@Param('id') id: string, @Req() req: Request) {
    return this.textChannelsService.getChannel({
      channelId: id,
      joinedChannels: req.session.joinedChannels ?? [],
      ctx: manageContext(req),
    });
  }

  @Throttle({ default: { limit: 5, ttl: 3600_000 } })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create(@Body() textChannel: CreateTextChannelDto, @Req() req: Request) {
    const user = req.user as User | undefined;

    const channel = await this.textChannelsService.createTextChannel({ textChannel, user });
    req.session.joinedChannels = [...(req.session.joinedChannels ?? []), channel.id];
    return channel;
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post(':id/join')
  async join(@Param('id') id: string, @Body() { authKey }: JoinTextChannelDto, @Req() req: Request) {
    await this.textChannelsService.verifyChannelAuthKey({ channelId: id, authKey });

    const joinedChannels = req.session.joinedChannels ?? [];
    if (!joinedChannels.includes(id)) {
      req.session.joinedChannels = [...joinedChannels, id];
    }

    const user = req.user as User | undefined;
    if (user) {
      await this.textChannelsService.rememberRoom({ userId: user.id, roomId: id });
    }

    return { joined: true };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':id/leave')
  async leaveRoom(@Param('id') id: string, @Req() req: Request) {
    req.session.joinedChannels = (req.session.joinedChannels ?? []).filter((channelId) => channelId !== id);

    const user = req.user as User | undefined;
    if (user) {
      await this.textChannelsService.forgetRoom({ userId: user.id, roomId: id });
    }
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
