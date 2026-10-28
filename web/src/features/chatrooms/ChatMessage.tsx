import React from 'react';
import type { DecryptedMessage } from './Chatroom.tsx';
import styles from './ChatMessage.module.scss';

interface ChatMessageProps {
  decrypted?: DecryptedMessage;
  mine: boolean;
  createdAt: string;
  firstOfRun: boolean;
}

const formatSentAt = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const ChatMessage = ({ decrypted, mine, createdAt, firstOfRun }: ChatMessageProps) => {
  const text = decrypted?.text ?? '…';
  const author = mine ? '' : (decrypted?.nickname ?? 'User');

  return (
    <div className={styles.row}>
      <div className={[styles.wrap, mine ? styles.mine : styles.theirs].join(' ')}>
        {firstOfRun && (
          <p className={[styles.label, mine ? styles.labelMine : styles.labelTheirs].join(' ')}>
            {author}
            <time className={styles.sentAt} dateTime={createdAt} title={new Date(createdAt).toLocaleString()}>
              {formatSentAt(createdAt)}
            </time>
          </p>
        )}
        <div className={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs].join(' ')}>
          <span className={styles.text}>{text}</span>
        </div>
      </div>
    </div>
  );
};
