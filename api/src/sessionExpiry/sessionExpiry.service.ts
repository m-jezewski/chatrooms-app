import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionExpiryService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SessionExpiryService.name);

  constructor(private prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.sweepExpiredSessions();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async sweepExpiredSessions(): Promise<void> {
    try {
      const { count } = await this.prisma.session.deleteMany({ where: { expire: { lt: new Date() } } });

      if (count > 0) {
        this.logger.log(`Swept ${count} expired session(s)`);
      }
    } catch (error) {
      this.logger.error('Failed to sweep expired sessions', error instanceof Error ? error.stack : error);
    }
  }
}
