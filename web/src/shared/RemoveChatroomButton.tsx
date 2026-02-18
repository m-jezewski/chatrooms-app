import { AppButton } from './AppButton.tsx';
import React from 'react';
import toast from 'react-hot-toast';
import { useDeleteChatroomMutation } from '../services/chatroomsApi.ts';
import { useNavigate } from 'react-router';

interface RemoveChatroomButtonProps {
  channelId?: string | number;
}

export const RemoveChatroomButton = ({channelId}: RemoveChatroomButtonProps) => {
  const [deleteChatroom] = useDeleteChatroomMutation();
  const navigate = useNavigate()

  const handleRemoveClick = async () => {
    if (!channelId) {
      return
    }

    try {
      await deleteChatroom(Number(channelId)).unwrap()
      navigate("/chatrooms")
      toast.success('Successfully removed the chatroom!')
    } catch (e) {
      toast.error("Cannot remove channel")
    }
  }

  return (
    <AppButton variant={'red'} onClick={() => handleRemoveClick()}>
      Delete
    </AppButton>
  )
}