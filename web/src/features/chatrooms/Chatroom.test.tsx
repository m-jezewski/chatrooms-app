// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';
import '@testing-library/jest-dom/vitest';
import { store } from '../../store.ts';
import { Message } from '../../interfaces.ts';
import { openedChannel, setMessages } from '../messages/messagesSlice.ts';
import { Chatroom } from './Chatroom.tsx';

const { decrypt, roomKey } = vi.hoisted(() => {
  vi.stubEnv('VITE_API_URL', 'http://api.test');
  return { decrypt: vi.fn(), roomKey: {} };
});

vi.mock('../../utils/roomCrypto.ts', () => ({ decrypt, generateSenderId: () => 'someone-else' }));
vi.mock('./RoomKeyContext.tsx', () => ({ useRoomKey: () => ({ secrets: { key: roomKey } }) }));

const message = (id: string): Message => ({
  id,
  payload: `cipher-${id}`,
  senderId: 'author',
  createdAt: '2026-10-18T10:00:00.000Z',
  textChannelId: 'room-1',
});

const logContains = (...messages: Message[]) => {
  store.dispatch(setMessages({ channelId: 'room-1', messages, hasMore: true }));
};

const show = () =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/chatrooms/room-1']}>
        <Routes>
          <Route path="/chatrooms/:roomId" element={<Chatroom />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

describe('Chatroom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    decrypt.mockImplementation(async (_key: unknown, cipher: string) =>
      JSON.stringify({ nickname: `Author of ${cipher}`, text: `text for ${cipher}` }),
    );
    store.dispatch(openedChannel('room-1'));
  });

  afterEach(cleanup);

  it('shows what every message in the log says', async () => {
    logContains(message('1'), message('2'));
    show();

    expect(await screen.findByText('text for cipher-1')).toBeInTheDocument();
    expect(screen.getByText('text for cipher-2')).toBeInTheDocument();
    expect(screen.getByText('Author of cipher-1')).toBeInTheDocument();
  });

  it('decrypts a message once however often the log around it is replaced', async () => {
    logContains(message('1'), message('2'));
    show();
    expect(await screen.findByText('text for cipher-1')).toBeInTheDocument();

    await act(async () => {
      logContains(message('2'));
    });

    expect(screen.queryByText('text for cipher-1')).not.toBeInTheDocument();

    await act(async () => {
      logContains(message('1'), message('2'));
    });

    expect(decrypt.mock.calls.map(([, cipher]) => cipher)).toEqual(['cipher-1', 'cipher-2', 'cipher-1']);
  });
});
