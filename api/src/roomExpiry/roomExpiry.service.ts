import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomExpiryService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RoomExpiryService.name);

  constructor(private prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.sweepExpiredRooms();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async sweepExpiredRooms(): Promise<void> {
    try {
      const { count } = await this.prisma.textChannel.deleteMany({ where: { expiresAt: { lt: new Date() } } });

      if (count > 0) {
        this.logger.log(`Swept ${count} expired room(s)`);
      }
    } catch (error) {
      this.logger.error('Failed to sweep expired rooms', error instanceof Error ? error.stack : error);
    }
  }
}
