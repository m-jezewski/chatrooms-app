import { Module } from '@nestjs/common';
import { TextChannelsController } from './textChannels.controller';
import { TextChannelsService } from './textChannels.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [PrismaModule, MessagesModule],
  controllers: [TextChannelsController],
  providers: [TextChannelsService],
  exports: [TextChannelsService],
})
export class TextChannelsModule {}
