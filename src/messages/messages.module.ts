import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagesGateway } from './MessagesGateway';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TextChannelsModule } from '../textChannels/textChannels.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, TextChannelsModule, UsersModule],
  controllers: [MessagesController],
  providers: [MessagesGateway, MessagesService],
  exports: [MessagesGateway, MessagesService],
})
export class MessagesModule {}
