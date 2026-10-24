import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
import { PrismaExceptionFilter } from './prisma/PrismaClientExceptionFilter';
import { WebSocketAdapter } from './messages/WebSocketAdapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const sessionMaxAge = configService.get<number>('session.maxAge');
  const isSecureCookie = configService.get<boolean>('session.cookie.secure');
  const sameSiteCookie = configService.get<'strict' | 'lax' | 'none'>('session.cookie.sameSite');

  const expressSession = session({
    secret: configService.get('session.secret'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: sessionMaxAge,
      httpOnly: true,
      secure: isSecureCookie,
      sameSite: sameSiteCookie,
    },
  });

  app.use(expressSession);

  app.enableCors({
    origin: configService.get('cors.origin'),
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new PrismaExceptionFilter());

  app.use((req, res, next) => {
    if (req.session) {
      req.session.cookie.maxAge = sessionMaxAge;
    }
    next();
  });

  app.use(passport.initialize());
  app.use(passport.session());

  app.useWebSocketAdapter(new WebSocketAdapter(app, expressSession));

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
