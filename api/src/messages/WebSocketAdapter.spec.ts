import { IoAdapter } from '@nestjs/platform-socket.io';
import { WebSocketAdapter } from './WebSocketAdapter';

jest.mock('express-socket.io-session', () => jest.fn(() => 'shared-session-middleware'));

describe('WebSocketAdapter', () => {
  const use = jest.fn();
  let createIOServer: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    createIOServer = jest.spyOn(IoAdapter.prototype, 'createIOServer').mockReturnValue({ use });
  });

  afterEach(() => {
    createIOServer.mockRestore();
  });

  const adapter = () => new WebSocketAdapter({} as any, {} as any, 'http://front.test');

  it('takes the allowed origin from the configuration instead of the environment', () => {
    adapter().createIOServer(0, { cookie: true });

    expect(createIOServer).toHaveBeenCalledWith(0, {
      cookie: true,
      cors: { origin: 'http://front.test', credentials: true },
    });
  });

  it('shares the express session with the socket server', () => {
    adapter().createIOServer(0);

    expect(use).toHaveBeenCalledWith('shared-session-middleware');
  });
});
