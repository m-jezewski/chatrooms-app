import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagesModule } from '../messages/messages.module';
import { RoomExpiryService } from './roomExpiry.service';

@Module({
  imports: [PrismaModule, MessagesModule],
  providers: [RoomExpiryService],
})
export class RoomExpiryModule {}
