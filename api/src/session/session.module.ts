import { Module } from '@nestjs/common';
import { SessionStore } from './sessionStore';

@Module({
  providers: [SessionStore],
  exports: [SessionStore],
})
export class SessionModule {}
