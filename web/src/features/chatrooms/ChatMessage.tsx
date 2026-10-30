import type { DecryptedMessage } from './Chatroom.tsx';
import { cx } from '../../utils/cx.ts';
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
      <div className={cx(styles.wrap, mine ? styles.mine : styles.theirs)}>
        {firstOfRun && (
          <p className={cx(styles.label, mine ? styles.labelMine : styles.labelTheirs)}>
            {author}
            <time className={styles.sentAt} dateTime={createdAt} title={new Date(createdAt).toLocaleString()}>
              {formatSentAt(createdAt)}
            </time>
          </p>
        )}
        <div className={cx(styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs)}>
          <span className={styles.text}>{text}</span>
        </div>
      </div>
    </div>
  );
};
