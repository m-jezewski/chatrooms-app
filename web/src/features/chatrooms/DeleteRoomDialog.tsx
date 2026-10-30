import React from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../shared/ConfirmModal.tsx';
import { Chatroom } from '../../interfaces.ts';
import { useDeleteChatroomMutation } from '../../services/chatroomsApi.ts';
import { getOwnerToken } from '../../utils/session.ts';
import { removeRecentRoom } from '../../utils/recentRooms.ts';
import styles from './DeleteRoomDialog.module.scss';
import { ERROR_MESSAGES, failureMessage } from '../../shared/requestError.ts';

interface DeleteRoomDialogProps {
  room: Chatroom;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteRoomDialog = ({ room, isOpen, onClose }: DeleteRoomDialogProps) => {
  const navigate = useNavigate();
  const [deleteChatroom] = useDeleteChatroomMutation();

  const handleConfirm = async () => {
    try {
      await deleteChatroom({ id: room.id, ownerToken: getOwnerToken(room.id) }).unwrap();
    } catch (error) {
      toast.error(
        failureMessage(error, 'Could not remove the room.', {
          403: ERROR_MESSAGES.OWNER_ONLY,
          404: ERROR_MESSAGES.ROOM_IS_GONE,
        }),
      );
      throw error;
    }
    removeRecentRoom(room.id);
    navigate('/chatrooms');
    toast.success('Successfully removed the room!');
  };

  return (
    <ConfirmModal
      title={'Delete room'}
      isOpen={isOpen}
      onClose={onClose}
      confirmLabel={'Delete'}
      danger
      onConfirm={handleConfirm}
    >
      <p className={styles.text}>
        Deleting <strong>#{room.name}</strong> removes every message in it for everyone. This cannot be undone.
      </p>
    </ConfirmModal>
  );
};
