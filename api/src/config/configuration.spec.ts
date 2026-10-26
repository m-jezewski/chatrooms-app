import configuration from './configuration';

describe('configuration', () => {
  const realEnv = process.env;

  beforeEach(() => {
    process.env = { ...realEnv };
  });

  afterAll(() => {
    process.env = realEnv;
  });

  it('locks the production cookie down when the environment says production', () => {
    process.env.NODE_ENV = 'production';

    const config = configuration();

    expect(config.isProduction).toBe(true);
    expect(config.session.cookie.secure).toBe(true);
    expect(config.session.cookie.sameSite).toBe('strict');
  });

  it('keeps the cookie usable over plain http anywhere else', () => {
    process.env.NODE_ENV = 'development';

    const config = configuration();

    expect(config.isProduction).toBe(false);
    expect(config.session.cookie.secure).toBe(false);
    expect(config.session.cookie.sameSite).toBe('lax');
  })

  it('falls back to development when nothing is set', () => {
    delete process.env.NODE_ENV;

    const config = configuration();

    expect(config.nodeEnv).toBe('development');
    expect(config.isProduction).toBe(false);
  });
});
