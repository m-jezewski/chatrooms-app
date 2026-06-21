import { Message } from '../../interfaces.ts';
import { ChatMessage } from './ChatMessage.tsx';
import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store.ts';
import { useParams } from 'react-router';
import { useLazyGetOlderMessagesQuery } from '../../services/chatroomsApi.ts';
import { prependMessages } from '../messages/messagesSlice.ts';
import { Loader } from '../../shared/Loader.tsx';

export const Chatroom = () => {
  const { id: channelId } = useParams();
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.messages.messages);
  const hasMore = useSelector((state: RootState) => state.messages.hasMore);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const prevLastMessageIdRef = useRef<string | null>(null);
  const prevScrollHeightRef = useRef(0);
  const isLoadingOlderRef = useRef(false);

  const [fetchOlderMessages, { isFetching }] = useLazyGetOlderMessagesQuery();

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

  const handleScroll = useCallback(async () => {
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
  }, [channelId, hasMore, isFetching, messages, fetchOlderMessages, dispatch]);

  return (
    <div ref={chatContainerRef} onScroll={handleScroll} className={'grow flex flex-col gap-2 p-4 overflow-y-auto'}>
      {hasMore && isFetching && (
        <div className="flex justify-center py-2">
          <Loader />
        </div>
      )}
      {messages.map((message: Message, index: number) => (
        <ChatMessage key={message.id}
                     previousMessageFromThisAuthor={index === 0 ? false : messages[index - 1]?.authorId === message?.authorId}
                     message={message} />
      ))}
    </div>
  );
};