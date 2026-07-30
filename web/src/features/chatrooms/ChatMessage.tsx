import React from 'react';
import type { DecryptedMessage } from './Chatroom.tsx';
import styles from './ChatMessage.module.scss';

interface ChatMessageProps {
  previousMessageFromThisAuthor: boolean;
  decrypted?: DecryptedMessage;
  mine: boolean;
}

export const ChatMessage = ({ previousMessageFromThisAuthor, decrypted, mine }: ChatMessageProps) => {
  const text = decrypted?.text ?? '…';
  const nickname = decrypted?.nickname ?? 'User';

  if (mine) {
    return (
      <div className={styles.row}>
        <div className={[styles.wrap, styles.mine].join(' ')}>
          {!previousMessageFromThisAuthor &&
            <p className={[styles.label, styles.labelMine].join(' ')}>You</p>}
          <div className={[styles.bubble, styles.bubbleMine].join(' ')}>
            <span className={styles.text}>{text}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.row}>
      <div className={[styles.wrap, styles.theirs].join(' ')}>
        {!previousMessageFromThisAuthor &&
          <p className={[styles.label, styles.labelTheirs].join(' ')}>{nickname}</p>}
        <div className={[styles.bubble, styles.bubbleTheirs].join(' ')}>
          <span className={styles.text}>{text}</span>
        </div>
      </div>
    </div>
  );
};
