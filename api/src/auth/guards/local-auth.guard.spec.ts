import { ExecutionContext } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';

describe('LocalAuthGuard', () => {
  const user = { id: 'user-1' };
  let request: any;
  let guard: LocalAuthGuard;
  let strategy: jest.SpyInstance;

  const passportLogIn = (user: unknown, options: any, done: (err?: unknown) => void) => {
    const previous = request.session;
    request.session = {};
    if (options?.keepSessionInfo) {
      Object.assign(request.session, previous);
    }
    request.user = user;
    done();
  };

  const context = () => ({ switchToHttp: () => ({ getRequest: () => request }) }) as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    request = { user, session: { joinedChannels: ['room-1', 'room-2'] }, logIn: jest.fn(passportLogIn) };
    strategy = jest.spyOn(Object.getPrototypeOf(LocalAuthGuard.prototype), 'canActivate').mockResolvedValue(true);
    guard = new LocalAuthGuard();
  });

  afterEach(() => {
    strategy.mockRestore();
  });

  it('keeps the rooms joined before logging in', async () => {
    await guard.canActivate(context());

    expect(request.session.joinedChannels).toEqual(['room-1', 'room-2']);
  });

  it('establishes the session only after the credentials were accepted', async () => {
    await guard.canActivate(context());

    expect(strategy).toHaveBeenCalledTimes(1);
    expect(request.logIn).toHaveBeenCalledTimes(1);
    expect(request.logIn.mock.invocationCallOrder[0]).toBeGreaterThan(strategy.mock.invocationCallOrder[0]);
  });

  it('logs in the user the strategy resolved', async () => {
    await guard.canActivate(context());

    expect(request.logIn.mock.calls[0][0]).toBe(user);
  });

  it('refuses the request when the session cannot be established', async () => {
    request.logIn = jest.fn((_user, _options, done) => done(new Error('session store is down')));

    await expect(guard.canActivate(context())).rejects.toThrow('session store is down');
  });
});
