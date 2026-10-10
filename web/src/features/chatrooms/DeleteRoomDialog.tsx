import React from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../shared/ConfirmModal.tsx';
import { Chatroom } from '../../interfaces.ts';
import { useDeleteChatroomMutation } from '../../services/chatroomsApi.ts';
import { getOwnerToken } from '../../utils/session.ts';
import { removeRecentRoom } from '../../utils/recentRooms.ts';
import styles from './DeleteRoomDialog.module.scss';

interface DeleteRoomDialogProps {
  room: Chatroom;
  isOpen: boolean;
  closeModal: () => void;
}

export const DeleteRoomDialog = ({ room, isOpen, closeModal }: DeleteRoomDialogProps) => {
  const navigate = useNavigate();
  const [deleteChatroom] = useDeleteChatroomMutation();

  const handleConfirm = async () => {
    try {
      await deleteChatroom({ id: room.id, ownerToken: getOwnerToken(room.id) }).unwrap();
    } catch (error) {
      toast.error('Cannot remove room');
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
      closeModal={closeModal}
      confirmLabel={'Delete'}
      danger
      onConfirm={handleConfirm}
    >
      <p className={styles.text}>
        Deleting <strong>#{room.name}</strong> removes every message in it for everyone.
        This cannot be undone.
      </p>
    </ConfirmModal>
  );
};
