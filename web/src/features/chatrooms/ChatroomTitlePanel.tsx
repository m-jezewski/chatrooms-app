import { AppButton } from '../../shared/AppButton.tsx';
import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { Chatroom } from '../../interfaces.ts';
import { selectLoggedUser } from '../auth/authSlice.ts';
import { EditChatroomFormModal } from './EditChatroomFormModal.tsx';
import { RemoveChatroomButton } from '../../shared/RemoveChatroomButton.tsx';
import styles from './ChatroomTitlePanel.module.scss';

interface ChatroomTitlePanelProps {
  channelData?: Chatroom
}

export const ChatroomTitlePanel = ({ channelData }: ChatroomTitlePanelProps) => {
  const {channelId} = useParams();
  const loggedUser = useSelector(selectLoggedUser);
  const [isEditFormOpen, setIsEditFormOpen] = useState<boolean>(false);

  const isOwner = !!channelData?.ownerId && channelData.ownerId === loggedUser?.id;

  return (
    <div className={styles.panel}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}># {channelData?.name}</h1>
      </div>
      {isOwner && (
        <div className={styles.actions}>
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