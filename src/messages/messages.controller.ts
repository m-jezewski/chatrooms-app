import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { SessionGuard } from '../auth/guards/session-guard';
import { User } from '@prisma/client';
import { Request } from 'express';
import { UpdateMessageDto, GetMessagesQueryDto } from './dto/messages.dto';
import { TextChannelsService } from '../textChannels/textChannels.service';
import { MessagesGateway } from './MessagesGateway';

@ApiTags('Messages')
@Controller('textChannels/:channelId/messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly textChannelsService: TextChannelsService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getMessages(
    @Param('channelId', ParseIntPipe) channelId: number,
    @Query() query: GetMessagesQueryDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    await this.textChannelsService.getChannel({ channelId, user });

    const messages = await this.messagesService.getChannelMessages({
      channelId,
      before: query.before,
      limit: query.limit + 1,
    });

    const hasMore = messages.length > query.limit;

    return {
      messages: hasMore ? messages.slice(0, -1) : messages,
      hasMore,
    };
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':messageId')
  async updateMessage(
    @Param('channelId', ParseIntPipe) channelId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() body: UpdateMessageDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    await this.textChannelsService.getChannel({ channelId, user });

    const message = await this.messagesService.updateMessage({ messageId, user, content: body.content });
    this.messagesGateway.notifyMessageUpdated({ channelId, message });

    return message;
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':messageId')
  async deleteMessage(
    @Param('channelId', ParseIntPipe) channelId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    await this.textChannelsService.getChannel({ channelId, user });

    const message = await this.messagesService.deleteMessage({ messageId, user });
    this.messagesGateway.notifyMessageDeleted({ channelId, messageId });

    return message;
  }
}
