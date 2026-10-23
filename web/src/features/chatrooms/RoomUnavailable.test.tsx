// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import '@testing-library/jest-dom/vitest';
import { RoomUnavailable } from './RoomUnavailable.tsx';

const { getRecentRooms, removeRecentRoom } = vi.hoisted(() => ({
  getRecentRooms: vi.fn(),
  removeRecentRoom: vi.fn(),
}));

vi.mock('../../utils/recentRooms.ts', () => ({ getRecentRooms, removeRecentRoom }));

const show = ({ notFound, onRetry = vi.fn() }: { notFound: boolean; onRetry?: () => void }) =>
  render(
    <MemoryRouter>
      <RoomUnavailable roomId={'room-1'} notFound={notFound} onRetry={onRetry} />
    </MemoryRouter>,
  );

describe('RoomUnavailable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRecentRooms.mockReturnValue([]);
  });

  afterEach(() => {
    cleanup();
  });

  it('names the room it remembers and drops it from the recent list', () => {
    getRecentRooms.mockReturnValue([
      { roomId: 'other-room', name: 'Lobby' },
      { roomId: 'room-1', name: 'General' },
    ]);

    show({ notFound: true });

    expect(screen.getByRole('heading')).toHaveTextContent('#General is gone');
    expect(screen.getByText(/removed it from your recent rooms/)).toBeInTheDocument();
    expect(removeRecentRoom).toHaveBeenCalledWith('room-1');
  });

  it('says only that the link leads nowhere when it never knew the room', () => {
    show({ notFound: true });

    expect(screen.getByRole('heading')).toHaveTextContent('No such room');
    expect(screen.getByText(/never existed/)).toBeInTheDocument();
  });

  it('offers a retry instead of a verdict when the server did not answer', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    show({ notFound: false, onRetry });
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(screen.getByRole('heading')).toHaveTextContent('Could not open this room');
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('keeps the room in the recent list while it is only unreachable', () => {
    getRecentRooms.mockReturnValue([{ roomId: 'room-1', name: 'General' }]);

    show({ notFound: false });

    expect(screen.queryByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(removeRecentRoom).not.toHaveBeenCalled();
  });

  it('always leaves a way back to the start screen', () => {
    show({ notFound: true });

    expect(screen.getByRole('link', { name: 'Back to start' })).toHaveAttribute('href', '/');
  });
});
