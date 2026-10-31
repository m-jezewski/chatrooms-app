// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';
import '@testing-library/jest-dom/vitest';
import { api } from '../../services/api.ts';
import authReducer, { setUser } from '../auth/authSlice.ts';
import { RoomList } from './RoomList.tsx';
import styles from './RoomList.module.scss';

const { getRecentRooms, subscribeToRecentRooms } = vi.hoisted(() => {
  vi.stubEnv('VITE_API_URL', 'http://api.test');
  return { getRecentRooms: vi.fn(), subscribeToRecentRooms: vi.fn(() => () => {}) };
});

vi.mock('../../utils/recentRooms.ts', () => ({ getRecentRooms, subscribeToRecentRooms }));

const user = { id: 'user-1', name: 'Maciej', email: 'user@example.com', createdAt: '2026-01-01T00:00:00.000Z' };

const answer = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });

const show = ({ loggedIn = false, openRoom = 'room-9' } = {}) => {
  const store = configureStore({
    reducer: { auth: authReducer, [api.reducerPath]: api.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

  if (loggedIn) {
    store.dispatch(setUser(user));
  }

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/chatrooms/${openRoom}`]}>
        <Routes>
          <Route path="/chatrooms/:roomId" element={<RoomList />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

const roomNames = () => screen.getAllByRole('link').map((link) => link.textContent);

describe('the room list in the sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRecentRooms.mockReturnValue([
      { roomId: 'room-1', name: 'General' },
      { roomId: 'room-2', name: 'Design crit' },
    ]);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('offers the rooms this browser has been in when nobody is logged in', () => {
    vi.stubGlobal('fetch', vi.fn());

    show();

    expect(screen.getByText('Recent')).toBeInTheDocument();
    expect(roomNames()).toEqual(['# General', '# Design crit']);
  });

  it('asks the server for nothing while nobody is logged in', async () => {
    const fetchMock = vi.fn().mockResolvedValue(answer([{ roomId: 'room-7', name: 'Standup' }]));
    vi.stubGlobal('fetch', fetchMock);

    show();
    await act(async () => {});

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByText('# Standup')).not.toBeInTheDocument();
  });

  it('shows the rooms kept on the account instead of the ones this browser remembers', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(answer([{ roomId: 'room-7', name: 'Standup' }])));

    show({ loggedIn: true });

    expect(await screen.findByText('# Standup')).toBeInTheDocument();
    expect(screen.getByText('Your rooms')).toBeInTheDocument();
    expect(screen.queryByText('# General')).not.toBeInTheDocument();
  });

  it('leads to the room behind every entry', () => {
    vi.stubGlobal('fetch', vi.fn());

    show();

    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/chatrooms/room-1',
      '/chatrooms/room-2',
    ]);
  });

  it('marks the room that is open and only that one', () => {
    vi.stubGlobal('fetch', vi.fn());

    show({ openRoom: 'room-2' });

    expect(screen.getByText('# Design crit')).toHaveClass(styles.active);
    expect(screen.getByText('# General')).not.toHaveClass(styles.active);
  });

  it('tells an anonymous visitor with no history where they stand', () => {
    vi.stubGlobal('fetch', vi.fn());
    getRecentRooms.mockReturnValue([]);

    show();

    expect(screen.getByText('No recent rooms yet.')).toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('tells a logged in user with an empty account where they stand', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(answer([])));

    show({ loggedIn: true });

    expect(await screen.findByText('No saved rooms yet.')).toBeInTheDocument();
  });
});
