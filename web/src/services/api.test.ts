import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const user = { id: 'user-1', name: 'Maciej', email: 'user@example.com', createdAt: '2026-01-01T00:00:00.000Z' };

const answer = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const loadApp = async () => {
  const [{ store }, { authApi }] = await Promise.all([import('../store.ts'), import('./authApi.ts')]);
  return { store, authApi };
};

const askForStatus = async (
  store: Awaited<ReturnType<typeof loadApp>>['store'],
  authApi: Awaited<ReturnType<typeof loadApp>>['authApi'],
) => store.dispatch(authApi.endpoints.status.initiate(undefined, { forceRefetch: true }));

describe('what happens when the server stops recognising the session', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_API_URL', 'http://api.test');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('drops the local user the moment any request comes back unauthorized', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(answer(user, 200))
        .mockResolvedValueOnce(answer({ message: 'Unauthorized' }, 401)),
    );
    const { store, authApi } = await loadApp();

    await askForStatus(store, authApi);
    expect(store.getState().auth.user).toMatchObject({ id: 'user-1' });

    await askForStatus(store, authApi);
    expect(store.getState().auth.user).toBeNull();
  });

  it('keeps the user logged in when the server merely breaks', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(answer(user, 200))
        .mockResolvedValueOnce(answer({ message: 'Boom' }, 500)),
    );
    const { store, authApi } = await loadApp();

    await askForStatus(store, authApi);
    await askForStatus(store, authApi);

    expect(store.getState().auth.user).toMatchObject({ id: 'user-1' });
  });
});
