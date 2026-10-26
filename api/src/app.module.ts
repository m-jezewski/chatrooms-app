import { ExecutionContext, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { HealthController } from './health/health.controller';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { MessagesModule } from './messages/messages.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TextChannelsModule } from './textChannels/textChannels.module';
import { RoomExpiryModule } from './roomExpiry/roomExpiry.module';
import { SessionExpiryModule } from './sessionExpiry/sessionExpiry.module';
import { SessionModule } from './session/session.module';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
      skipIf: (context: ExecutionContext) => context.getType() !== 'http',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    MessagesModule,
    UsersModule,
    TextChannelsModule,
    RoomExpiryModule,
    SessionExpiryModule,
    SessionModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
