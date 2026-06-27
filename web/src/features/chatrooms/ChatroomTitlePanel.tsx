import { AppButton } from '../../shared/AppButton.tsx';
import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { Chatroom } from '../../interfaces.ts';
import { selectLoggedUser } from '../auth/authSlice.ts';
import { EditChatroomFormModal } from './EditChatroomFormModal.tsx';
import { RemoveChatroomButton } from '../../shared/RemoveChatroomButton.tsx';

interface ChatroomTitlePanelProps {
  channelData?: Chatroom
}

export const ChatroomTitlePanel = ({ channelData }: ChatroomTitlePanelProps) => {
  const {channelId} = useParams();
  const loggedUser = useSelector(selectLoggedUser);
  const [isEditFormOpen, setIsEditFormOpen] = useState<boolean>(false);

  const isOwner = !!channelData?.ownerId && channelData.ownerId === loggedUser?.id;

  return (
    <div className={"ml-20 mt-4 mb-4 mr-4 md:ml-4 bg-indigo-900/25 backdrop-blur-xl p-4 rounded-lg"}>
      <h1 className={"text-3xl mb-2 border-b-2 pb-1 break-all border-gray-700"}># {channelData?.name}</h1>
      {isOwner && (
        <div className="flex gap-2 justify-end">
         <RemoveChatroomButton channelId={channelId} />
          <AppButton onClick={() => setIsEditFormOpen(true)}>
            Edit
          </AppButton>
        </div>
      )}

      {channelData && <EditChatroomFormModal
        initialValues={channelData}
        closeModal={() => setIsEditFormOpen(false)}
        isOpen={isEditFormOpen}
      />}
    </div>
  )
}