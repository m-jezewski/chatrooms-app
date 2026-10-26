import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import * as connectPgSimple from 'connect-pg-simple';

const POOL_MAX = 3;

@Injectable()
export class SessionStore implements OnApplicationShutdown {
  private readonly logger = new Logger(SessionStore.name);
  private readonly pgStore: connectPgSimple.PGStore;

  constructor(configService: ConfigService) {
    const PgSession = connectPgSimple(session);

    this.pgStore = new PgSession({
      conObject: { connectionString: configService.get<string>('database.url'), max: POOL_MAX },
      createTableIfMissing: false,
      pruneSessionInterval: false,
      errorLog: (message, ...rest) => this.logger.error(message, ...rest),
    });
  }

  get store(): session.Store {
    return this.pgStore;
  }

  onApplicationShutdown(): void {
    this.pgStore.close();
  }
}
