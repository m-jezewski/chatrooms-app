import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { RoomExpiryService } from './roomExpiry.service';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  providers: [RoomExpiryService],
})
export class RoomExpiryModule {}
