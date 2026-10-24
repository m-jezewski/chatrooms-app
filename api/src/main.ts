import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
import { PrismaExceptionFilter } from './prisma/PrismaClientExceptionFilter';
import { WebSocketAdapter } from './messages/WebSocketAdapter';
import * as connectPgSimple from 'connect-pg-simple';

const SESSION_POOL_MAX = 3;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const sessionMaxAge = configService.get<number>('session.maxAge');
  const isSecureCookie = configService.get<boolean>('session.cookie.secure');
  const sameSiteCookie = configService.get<'strict' | 'lax' | 'none'>('session.cookie.sameSite');
  const corsOrigin = configService.get<string>('cors.origin');

  const PgSession = connectPgSimple(session);
  const storeLogger = new Logger('SessionStore');

  const expressSession = session({
    secret: configService.get('session.secret'),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: new PgSession({
      conObject: { connectionString: configService.get<string>('database.url'), max: SESSION_POOL_MAX },
      createTableIfMissing: false,
      pruneSessionInterval: false,
      errorLog: (message, ...rest) => storeLogger.error(message, ...rest),
    }),
    cookie: {
      maxAge: sessionMaxAge,
      httpOnly: true,
      secure: isSecureCookie,
      sameSite: sameSiteCookie,
    },
  });

  app.use(expressSession);

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new PrismaExceptionFilter());

  app.use(passport.initialize());
  app.use(passport.session());

  app.useWebSocketAdapter(new WebSocketAdapter(app, expressSession, corsOrigin));

  if (!configService.get('isProduction')) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Chatrooms API')
      .setDescription('API for chatrooms application')
      .setVersion('1.0')
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, swaggerDocument);
  }

  const port = configService.get('port');
  await app.listen(port);
}

bootstrap().catch((error) => {
  new Logger('Bootstrap').error('Application failed to start', error);
  process.exit(1);
});
