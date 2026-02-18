import { Message } from '../../interfaces.ts';
import { ChatMessage } from './ChatMessage.tsx';
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store.ts';
import { useParams } from 'react-router';

export const Chatroom = () => {
  const {id: channelId} = useParams();
  const messages = useSelector((state: RootState) => state.messages.messages);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (channelId && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={chatContainerRef} className={"grow flex flex-col gap-2 p-4 overflow-y-auto"}>
      {messages.map((message: Message, index: number) => (
        <ChatMessage key={message.id}
                     previousMessageFromThisAuthor={index === 0 ? false : messages[index - 1]?.authorId === message?.authorId}
                     message={message} />
      ))}
    </div>
  )
}