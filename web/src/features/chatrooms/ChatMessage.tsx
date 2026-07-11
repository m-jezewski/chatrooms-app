import React from 'react';
import type { DecryptedMessage } from './Chatroom.tsx';

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
      <div className={'flex gap-2 flex-row'}>
        <div className={'w-fit ml-auto'}>
          {!previousMessageFromThisAuthor &&
            <p className={'text-right text-gray-500 font-medium text-xs pr-2'}>You</p>}
          <div className={'p-1.5 px-3 max-w-72 w-fit bg-purple-900 rounded-2xl'}>
            <span style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }} className={'max-w-full text-md'}>{text}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={'flex gap-2 flex-row'}>
      <div className={'w-fit mr-auto'}>
        {!previousMessageFromThisAuthor &&
          <p className={'text-left text-gray-500 font-medium text-xs pl-2'}>{nickname}</p>}
        <div className={'p-1.5 px-3 max-w-72 w-fit bg-blue-900 rounded-2xl'}>
          <span style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }} className={'max-w-full text-md'}>{text}</span>
        </div>
      </div>
    </div>
  );
};