import { AppButton } from '../../shared/AppButton.tsx';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Chatroom, RoomEntry } from '../../interfaces.ts';
import { selectLoggedUser } from '../auth/authSlice.ts';
import { EditChatroomForm } from './EditChatroomForm.tsx';
import { EditRoomTtlForm } from './EditRoomTtlForm.tsx';
import { DeleteRoomDialog } from './DeleteRoomDialog.tsx';
import { DropdownMenu } from '../../shared/DropdownMenu.tsx';
import { AppModal } from '../../shared/AppModal.tsx';
import { AppIcon } from '../../shared/AppIcon.tsx';
import GearIcon from '../../assets/icons/gear.svg?react';
import { getOwnerToken } from '../../utils/session.ts';
import { useRoomKeyContext } from './RoomKeyContext.tsx';
import { useLeaveRoomMutation, useRotateInviteCodeMutation } from '../../services/chatroomsApi.ts';
import styles from './ChatroomTitlePanel.module.scss';

interface ChatroomTitlePanelProps {
  entry?: RoomEntry;
  channelData?: Chatroom;
}

export const ChatroomTitlePanel = ({ entry, channelData }: ChatroomTitlePanelProps) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const loggedUser = useSelector(selectLoggedUser);
  const { clearKey } = useRoomKeyContext();

  const [rotateInviteCode] = useRotateInviteCodeMutation();
  const [leaveRoom, { isLoading: leaving }] = useLeaveRoomMutation();

  const [expiryOpen, setExpiryOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const ownerToken = roomId ? getOwnerToken(roomId) : null;
  const isOwner = (!!channelData?.ownerId && channelData.ownerId === loggedUser?.id) || !!ownerToken;

  const handleRotate = async () => {
    if (!roomId) return;
    try {
      await rotateInviteCode({ id: roomId, ownerToken }).unwrap();
      toast.success('Invite code rotated — the old link is now dead.');
    } catch {
      toast.error('Could not rotate the invite code.');
    }
  };

  const handleLeave = async () => {
    if (!roomId) return;
    try {
      await leaveRoom(roomId).unwrap();
    } catch {
      toast.error('Could not leave the room.');
      return;
    }
    clearKey(roomId);
    navigate('/');
  };

  const copyInvite = () => {
    if (!channelData) return;
    const link = `${window.location.origin}/join/${channelData.inviteCode}`;
    navigator.clipboard?.writeText(link);
    toast.success('Invite link copied.');
  };

  return (
    <div className={styles.panel}>
      <div>
        <div className={styles.title}>
          <span className={styles.hash}>#</span>
          <h1>{entry?.name}</h1>
        </div>
        <div className={styles.loggedUsersInfo}>1 user online {/* TODO */}</div>
      </div>
      <div className={styles.ownerBar}>
        {isOwner && (
          <DropdownMenu
            aria-label="Room admin actions"
            label={
              <>
                <AppIcon icon={GearIcon} className={styles.gear} />
                Admin
              </>
            }
            options={[
              { label: 'Change expiry', onSelect: () => setExpiryOpen(true) },
              { label: 'Change name', onSelect: () => setRenameOpen(true) },
              { label: 'Delete room', onSelect: () => setDeleteOpen(true), danger: true },
            ]}
          />
        )}

        {loggedUser && (
          <AppButton compact={true} variant={'transparent'} onClick={handleLeave} disabled={leaving}>
            {leaving ? 'Leaving…' : 'Leave room'}
          </AppButton>
        )}

        {channelData && (
          <div className={styles.code}>
            <code>{channelData.inviteCode}</code>
            <AppButton compact={true} variant={'transparent'} onClick={copyInvite}>
              Copy link
            </AppButton>
            {isOwner && (
              <AppButton compact={true} variant={'transparent'} onClick={handleRotate}>
                Rotate
              </AppButton>
            )}
          </div>
        )}
      </div>

      {channelData && (
        <>
          <AppModal title={'Change expiry'} isOpen={expiryOpen} onClose={() => setExpiryOpen(false)}>
            {(close) => <EditRoomTtlForm room={channelData} closeModal={close} />}
          </AppModal>

          <AppModal title={'Change name'} isOpen={renameOpen} onClose={() => setRenameOpen(false)}>
            {(close) => <EditChatroomForm initialValues={channelData} closeModal={close} />}
          </AppModal>

          <DeleteRoomDialog room={channelData} isOpen={deleteOpen} closeModal={() => setDeleteOpen(false)} />
        </>
      )}
    </div>
  );
};
