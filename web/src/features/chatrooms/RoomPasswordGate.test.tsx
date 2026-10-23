// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom/vitest';
import { store } from '../../store.ts';
import { RoomEntry } from '../../interfaces.ts';
import { RoomSecrets } from '../../utils/roomCrypto.ts';
import { RoomPasswordGate } from './RoomPasswordGate.tsx';

const { deriveRoomSecrets, base64ToUint8 } = vi.hoisted(() => {
  vi.stubEnv('VITE_API_URL', 'http://api.test');
  return { deriveRoomSecrets: vi.fn(), base64ToUint8: vi.fn() };
});

vi.mock('../../utils/roomCrypto.ts', () => ({ deriveRoomSecrets, base64ToUint8 }));

const entry: RoomEntry = { roomId: 'room-1', name: 'General', salt: 'c2FsdHNhbHRzYWx0c2E=' };

const secrets = { authKey: `${'A'.repeat(43)}=`, key: {} } as unknown as RoomSecrets;

const answer = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const unlock = async (password = 'correct horse battery') => {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText('Room password'), password);
  await user.click(screen.getByRole('button', { name: 'Join room' }));
};

const show = (onJoin = vi.fn()) => {
  render(
    <Provider store={store}>
      <RoomPasswordGate entry={entry} onJoin={onJoin} />
    </Provider>,
  );

  return onJoin;
};

describe('RoomPasswordGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    base64ToUint8.mockReturnValue(new Uint8Array(16));
    deriveRoomSecrets.mockResolvedValue(secrets);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('refuses to send anything when the room password is missing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const onJoin = show();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Join room' }));

    expect(await screen.findByText('Password is required')).toBeInTheDocument();
    expect(deriveRoomSecrets).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onJoin).not.toHaveBeenCalled();
  });

  it('blames the room data, not the password, when deriving the key fails', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    deriveRoomSecrets.mockRejectedValue(new Error('bad base64'));
    const onJoin = show();

    await unlock();

    expect(await screen.findByText(/encryption data looks damaged/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onJoin).not.toHaveBeenCalled();
  });

  it('tells the user to wait when the server is rate limiting the room', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(answer({ message: 'Too Many Requests' }, 429)));
    const onJoin = show();

    await unlock();

    expect(await screen.findByText('Too many attempts — try again in a minute')).toBeInTheDocument();
    expect(onJoin).not.toHaveBeenCalled();
  });

  it('reports a wrong password for any other rejection', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(answer({ message: 'Unauthorized' }, 401)));
    const onJoin = show();

    await unlock();

    expect(await screen.findByText('Incorrect password')).toBeInTheDocument();
    expect(onJoin).not.toHaveBeenCalled();
  });

  it('hands the derived secrets over once the server accepts the key', async () => {
    const fetchMock = vi.fn().mockResolvedValue(answer({ joined: true }, 200));
    vi.stubGlobal('fetch', fetchMock);
    const onJoin = show();

    await unlock('correct horse battery');

    expect(onJoin).toHaveBeenCalledWith(secrets);
    expect(deriveRoomSecrets).toHaveBeenCalledWith('correct horse battery', new Uint8Array(16));
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(screen.queryByText('Incorrect password')).not.toBeInTheDocument();
  });

  it('sends the room password nowhere but keeps the auth key for the join call', async () => {
    const fetchMock = vi.fn().mockResolvedValue(answer({ joined: true }, 200));
    vi.stubGlobal('fetch', fetchMock);
    show();

    await unlock('correct horse battery');

    const request = fetchMock.mock.calls[0][0] as Request;
    const body = await request.text();

    expect(request.url).toBe('http://api.test/textChannels/room-1/join');
    expect(body).toBe(JSON.stringify({ authKey: secrets.authKey }));
    expect(body).not.toContain('correct horse battery');
  });
});
