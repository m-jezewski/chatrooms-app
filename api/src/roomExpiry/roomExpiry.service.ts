import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesGateway } from '../messages/MessagesGateway';

@Injectable()
export class RoomExpiryService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RoomExpiryService.name);

  constructor(
    private prisma: PrismaService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.sweepExpiredRooms();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async sweepExpiredRooms(): Promise<void> {
    try {
      const cutoff = new Date();
      const expired = await this.prisma.textChannel.findMany({
        where: { expiresAt: { lt: cutoff } },
        select: { id: true },
      });

      if (expired.length === 0) {
        return;
      }

      const roomIds = expired.map((room) => room.id);
      const { count } = await this.prisma.textChannel.deleteMany({
        where: { id: { in: roomIds }, expiresAt: { lt: cutoff } },
      });

      if (count > 0) {
        roomIds.forEach((roomId) => this.messagesGateway.closeChannel(roomId));
        this.logger.log(`Swept ${count} expired room(s)`);
      }
    } catch (error) {
      this.logger.error('Failed to sweep expired rooms', error instanceof Error ? error.stack : error);
    }
  }
}
