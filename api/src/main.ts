import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
import helmet from 'helmet';
import { PrismaExceptionFilter } from './prisma/PrismaClientExceptionFilter';
import { WebSocketAdapter } from './messages/WebSocketAdapter';
import { SessionStore } from './session/sessionStore';
import { WEB_CLIENT_ROOT } from './web/webClient';
import { securityHeaders } from './security/securityHeaders';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const sessionMaxAge = configService.getOrThrow<number>('session.maxAge');
  const isSecureCookie = configService.getOrThrow<boolean>('session.cookie.secure');
  const sameSiteCookie = configService.getOrThrow<'strict' | 'lax' | 'none'>('session.cookie.sameSite');
  const corsOrigin = configService.getOrThrow<string>('cors.origin');
  const isProduction = configService.getOrThrow<boolean>('isProduction');

  app.use(helmet(securityHeaders(isProduction)));

  if (isProduction) {
    app.set('trust proxy', 1);
    app.useStaticAssets(WEB_CLIENT_ROOT, { index: false });
  }

  const expressSession = session({
    secret: configService.getOrThrow<string>('session.secret'),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: app.get(SessionStore).store,
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

  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Chatrooms API')
      .setDescription('API for chatrooms application')
      .setVersion('1.0')
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, swaggerDocument);
  }

  app.enableShutdownHooks();

  const port = configService.getOrThrow<number>('port');
  await app.listen(port);
}

bootstrap().catch((error) => {
  new Logger('Bootstrap').error('Application failed to start', error);
  process.exit(1);
});
