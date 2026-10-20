import { INestApplication, ModuleMetadata, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { User } from '@prisma/client';
import * as session from 'express-session';
import * as passport from 'passport';
import { PrismaExceptionFilter } from '../src/prisma/PrismaClientExceptionFilter';

interface TestAppOptions extends ModuleMetadata {
  user?: Pick<User, 'id'>;
}

export const createTestApp = async ({ user, ...metadata }: TestAppOptions): Promise<INestApplication> => {
  const moduleRef = await Test.createTestingModule(metadata).compile();
  const app = moduleRef.createNestApplication();

  app.use(session({ secret: 'a-test-secret-that-is-long-enough', resave: false, saveUninitialized: false }));
  app.use(passport.initialize());
  app.use(passport.session());

  if (user) {
    app.use((req, _res, next) => {
      req.user = user;
      next();
    });
  }

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new PrismaExceptionFilter());

  await app.init();
  return app;
};
