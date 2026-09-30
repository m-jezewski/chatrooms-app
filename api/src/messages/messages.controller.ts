import { ClassSerializerInterceptor, Controller, Get, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { GetMessagesQueryDto } from './dto/messages.dto';
import { ChannelJoinedGuard } from '../textChannels/guards/channel-joined.guard';

@ApiTags('Messages')
@Controller('textChannels/:channelId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(ChannelJoinedGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getMessages(@Param('channelId') channelId: string, @Query() query: GetMessagesQueryDto) {
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
}
