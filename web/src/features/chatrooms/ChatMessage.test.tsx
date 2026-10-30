// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ChatMessage } from './ChatMessage.tsx';
import { DecryptedMessage } from './Chatroom.tsx';

const SENT_AT = '2026-10-18T10:31:00.000Z';

const decrypted: DecryptedMessage = { nickname: 'Ada', text: 'hello there', cipher: 'cipher' };

interface ShowOptions {
  mine: boolean;
  firstOfRun?: boolean;
  decrypted?: DecryptedMessage;
}

const show = (options: ShowOptions) =>
  render(
    <ChatMessage
      mine={options.mine}
      firstOfRun={options.firstOfRun ?? true}
      decrypted={'decrypted' in options ? options.decrypted : decrypted}
      createdAt={SENT_AT}
    />,
  );

const sentAt = () => screen.queryByText(/^\d{1,2}:\d{2}$/);

describe('ChatMessage', () => {
  afterEach(cleanup);

  it('leaves my own message unnamed, because the side it sits on already says who wrote it', () => {
    const { container } = show({ mine: true });

    expect(screen.queryByText('Ada')).not.toBeInTheDocument();
    expect(container.querySelector('p')?.textContent).toBe(sentAt()?.textContent);
  });

  it('credits someone else by the nickname carried inside the encrypted payload', () => {
    show({ mine: false });

    expect(screen.getByText('Ada')).toBeInTheDocument();
  });

  it('falls back to a placeholder author while the message is still encrypted', () => {
    show({ mine: false, decrypted: undefined });

    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('…')).toBeInTheDocument();
  });

  it('stamps the time beside the author, not inside the bubble', () => {
    const { container } = show({ mine: false });

    expect(sentAt()).toHaveAttribute('datetime', SENT_AT);
    expect(sentAt()?.tagName).toBe('TIME');
    expect(sentAt()?.parentElement).toBe(container.querySelector('p'));
  });

  it('drops the whole author line, time included, in the middle of a run', () => {
    show({ mine: false, firstOfRun: false });

    expect(screen.queryByText('Ada')).not.toBeInTheDocument();
    expect(sentAt()).not.toBeInTheDocument();
    expect(screen.getByText('hello there')).toBeInTheDocument();
  });

  it('dresses my own message for my side of the room', () => {
    const { container } = show({ mine: true });

    expect(container.querySelector('p')?.className).toMatch(/labelMine/);
    expect(container.querySelector('span')?.parentElement?.className).toMatch(/bubbleMine/);
    expect(container.firstElementChild?.firstElementChild?.className).toMatch(/_mine_/);
  });

  it('dresses someone elses message for the opposite side', () => {
    const { container } = show({ mine: false });

    expect(container.querySelector('p')?.className).toMatch(/labelTheirs/);
    expect(container.querySelector('span')?.parentElement?.className).toMatch(/bubbleTheirs/);
    expect(container.firstElementChild?.firstElementChild?.className).toMatch(/_theirs_/);
  });
});
