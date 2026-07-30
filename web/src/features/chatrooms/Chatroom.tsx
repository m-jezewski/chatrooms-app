import { Message } from '../../interfaces.ts';
import { ChatMessage } from './ChatMessage.tsx';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store.ts';
import { useParams } from 'react-router';
import { useLazyGetOlderMessagesQuery } from '../../services/chatroomsApi.ts';
import { prependMessages } from '../messages/messagesSlice.ts';
import { Loader } from '../../shared/Loader.tsx';
import { useRoomKey } from './RoomKeyContext.tsx';
import { decrypt } from '../../utils/roomCrypto.ts';
import { getSenderId } from '../../utils/session.ts';
import styles from './Chatroom.module.scss';


export interface DecryptedMessage {
  nickname: string;
  text: string;
  cipher: string;
}

export const Chatroom = () => {
  const { id: channelId } = useParams();
  const dispatch = useDispatch();
  const { secrets } = useRoomKey(channelId);
  const key = secrets?.key;
  const senderId = getSenderId();
  const messages = useSelector((state: RootState) => state.messages.messages);
  const hasMore = useSelector((state: RootState) => state.messages.hasMore);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const prevLastMessageIdRef = useRef<string | null>(null);
  const prevScrollHeightRef = useRef(0);
  const isLoadingOlderRef = useRef(false);

  const [decrypted, setDecrypted] = useState<Map<string, DecryptedMessage>>(new Map());
  const [fetchOlderMessages, { isFetching }] = useLazyGetOlderMessagesQuery();

  useEffect(() => {
    const pending = messages.filter((message) => decrypted.get(message.id)?.cipher !== message.payload);
    if (pending.length === 0 || !key) {
      return
    }

    (async () => {
      const decryptedEntries = await Promise.all(
        pending.map(async (message): Promise<[string, DecryptedMessage]> => {
          try {
            const { nickname, text } = JSON.parse(await decrypt(key, message.payload));
            return [message.id, { nickname, text, cipher: message.payload }];
          } catch {
            return [message.id, { nickname: 'Unknown', text: '[unable to decrypt]', cipher: message.payload }];
          }
        }),
      );

      setDecrypted((prev) => {
        const next = new Map(prev);
        for (const [id, value] of decryptedEntries) next.set(id, value);
        return next;
      });
    })();
  }, [messages, key, decrypted]);

  // Auto-scroll to bottom only on new messages (not on prepend)
  useEffect(() => {
    if (!channelId || !chatContainerRef.current) return;
    const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;

    if (lastMessageId !== prevLastMessageIdRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    prevLastMessageIdRef.current = lastMessageId;
  }, [messages, channelId]);

  // Restore scroll position after prepending older messages
  useEffect(() => {
    if (isLoadingOlderRef.current && chatContainerRef.current) {
      const newScrollHeight = chatContainerRef.current.scrollHeight;
      chatContainerRef.current.scrollTop = newScrollHeight - prevScrollHeightRef.current;
      isLoadingOlderRef.current = false;
    }
  }, [messages]);

  const handleScroll = async () => {
    const container = chatContainerRef.current;
    if (!container || !channelId || !hasMore || isFetching) return;
    if (container.scrollTop > 50) return;
    if (messages.length === 0) return;

    const oldestMessageId = messages[0].id;
    prevScrollHeightRef.current = container.scrollHeight;
    isLoadingOlderRef.current = true;

    try {
      const result = await fetchOlderMessages({
        channelId: channelId,
        before: oldestMessageId,
      }).unwrap();
      dispatch(prependMessages({ messages: result.messages, hasMore: result.hasMore }));
    } catch {
      isLoadingOlderRef.current = false;
    }
  };

  return (
    <div ref={chatContainerRef} onScroll={handleScroll} className={styles.messages}>
      {hasMore && isFetching && (
        <div className={styles.loaderRow}>
          <Loader />
        </div>
      )}
      {messages.map((message: Message, index: number) => (
        <ChatMessage
          key={message.id}
          previousMessageFromThisAuthor={index === 0 ? false : messages[index - 1]?.senderId === message?.senderId}
          decrypted={decrypted.get(message.id)}
          mine={message.senderId === senderId}
        />
      ))}
    </div>
  );
};
