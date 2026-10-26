import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
import { PrismaExceptionFilter } from './prisma/PrismaClientExceptionFilter';
import { WebSocketAdapter } from './messages/WebSocketAdapter';
import { SessionStore } from './session/sessionStore';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const sessionMaxAge = configService.get<number>('session.maxAge');
  const isSecureCookie = configService.get<boolean>('session.cookie.secure');
  const sameSiteCookie = configService.get<'strict' | 'lax' | 'none'>('session.cookie.sameSite');
  const corsOrigin = configService.get<string>('cors.origin');
  const isProduction = configService.get<boolean>('isProduction');

  if (isProduction) {
    app.set('trust proxy', 1);
  }

  const expressSession = session({
    secret: configService.get('session.secret'),
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

  const port = configService.get('port');
  await app.listen(port);
}

bootstrap().catch((error) => {
  new Logger('Bootstrap').error('Application failed to start', error);
  process.exit(1);
});
