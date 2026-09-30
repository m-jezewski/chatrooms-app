import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagesGateway } from './MessagesGateway';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';

@Module({
  imports: [PrismaModule],
  controllers: [MessagesController],
  providers: [MessagesGateway, MessagesService],
  exports: [MessagesGateway, MessagesService],
})
export class MessagesModule {}
