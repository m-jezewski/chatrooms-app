import { ConfigService } from '@nestjs/config';
import { SessionStore } from './sessionStore';

const close = jest.fn();

jest.mock(
  'connect-pg-simple',
  () => () =>
    class FakePgStore {
      options: unknown;
      close = close;

      constructor(options: unknown) {
        this.options = options;
      }
    },
);

describe('SessionStore', () => {
  const config = {
    get: jest.fn().mockReturnValue('postgresql://user:pass@localhost:5432/db'),
  } as unknown as ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('closes its connection pool when the application shuts down', () => {
    const sessionStore = new SessionStore(config);

    sessionStore.onApplicationShutdown();

    expect(close).toHaveBeenCalledTimes(1);
  });

  it('keeps its pool small and leaves the schema and pruning to us', () => {
    const sessionStore = new SessionStore(config);
    const { options } = sessionStore.store as unknown as { options: Record<string, any> };

    expect(options.conObject.max).toBe(3);
    expect(options.createTableIfMissing).toBe(false);
    expect(options.pruneSessionInterval).toBe(false);
  });

  it('takes the connection string from the configuration', () => {
    const sessionStore = new SessionStore(config);
    const { options } = sessionStore.store as unknown as { options: Record<string, any> };

    expect(config.get).toHaveBeenCalledWith('database.url');
    expect(options.conObject.connectionString).toBe('postgresql://user:pass@localhost:5432/db');
  });
});
