import { AppButton } from '../../shared/AppButton.tsx';
import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Chatroom } from '../../interfaces.ts';
import { selectLoggedUser } from '../auth/authSlice.ts';
import { EditChatroomForm } from './EditChatroomForm.tsx';
import { EditRoomTtlForm } from './EditRoomTtlForm.tsx';
import { DeleteRoomDialog } from './DeleteRoomDialog.tsx';
import { DropdownMenu } from '../../shared/DropdownMenu.tsx';
import { AppModal } from '../../shared/AppModal.tsx';
import { getOwnerToken } from '../../utils/session.ts';
import {
  useGetSavedRoomsQuery,
  useRotateInviteCodeMutation,
  useSaveRoomMutation,
  useUnsaveRoomMutation,
} from '../../services/chatroomsApi.ts';
import styles from './ChatroomTitlePanel.module.scss';

interface ChatroomTitlePanelProps {
  channelData?: Chatroom;
}

export const ChatroomTitlePanel = ({ channelData }: ChatroomTitlePanelProps) => {
  const { roomId } = useParams();
  const loggedUser = useSelector(selectLoggedUser);

  const [rotateInviteCode] = useRotateInviteCodeMutation();
  const [saveRoom] = useSaveRoomMutation();
  const [unsaveRoom] = useUnsaveRoomMutation();

  const { data: savedRooms = [] } = useGetSavedRoomsQuery(undefined, { skip: !loggedUser });
  const isSaved = !!roomId && savedRooms.some((room) => room.roomId === roomId);

  const [expiryOpen, setExpiryOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const ownerToken = roomId ? getOwnerToken(roomId) : null;
  const isOwner =
    (!!channelData?.ownerId && channelData.ownerId === loggedUser?.id) || !!ownerToken;

  const handleRotate = async () => {
    if (!roomId) return;
    try {
      await rotateInviteCode({ id: roomId, ownerToken }).unwrap();
      toast.success('Invite code rotated — the old link is now dead.');
    } catch {
      toast.error('Could not rotate the invite code.');
    }
  };

  const toggleSaved = async () => {
    if (!roomId) return;
    try {
      if (isSaved) {
        await unsaveRoom(roomId).unwrap();
      } else {
        await saveRoom({ id: roomId }).unwrap();
      }
    } catch {
      toast.error('Could not update saved rooms.');
    }
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
          <h1>{channelData?.name}</h1>
        </div>
        <div className={styles.loggedUsersInfo}>
          1 user online {/* TODO */}
        </div>
      </div>
      <div className={styles.ownerBar}>
        {isOwner && (
          <DropdownMenu
            aria-label="Room admin actions"
            label={
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.gear} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a7.7 7.7 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.5 6.5 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.5 6.5 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a7 7 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                </svg>
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

        <div className={styles.code}>
          <code>{channelData?.inviteCode}</code>
          <AppButton compact={true} variant={'transparent'} onClick={copyInvite}>Copy link</AppButton>
          {isOwner && <AppButton compact={true} variant={'transparent'} onClick={handleRotate}>Rotate</AppButton>}
        </div>
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
