import { join } from 'path';

export const WEB_CLIENT_ROOT = join(__dirname, '..', '..', 'web');

export const WEB_CLIENT_INDEX = join(WEB_CLIENT_ROOT, 'index.html');

export const CLIENT_ROUTES = [
  '/',
  '/create',
  '/join',
  '/join/:inviteCode',
  '/login',
  '/register',
  '/chatrooms',
  '/chatrooms/:roomId',
];
