import { useNavigate } from 'react-router';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppButton } from './AppButton.tsx';
import { useEntryHandoff } from './entryHandoff.ts';
import { RecentRoomsList } from '../features/rooms/RecentRoomsList.tsx';
import { SavedRoomsList } from '../features/rooms/SavedRoomsList.tsx';
import { CreateRoomDialog } from '../features/rooms/CreateRoomDialog.tsx';
import { JoinRoomDialog } from '../features/rooms/JoinRoomDialog.tsx';
import { AuthDialog } from '../features/auth/AuthDialog.tsx';
import { useLogoutMutation } from '../services/authApi.ts';
import { clearUser, selectLoggedUser } from '../features/auth/authSlice.ts';
import { useRoomKeyContext } from '../features/chatrooms/RoomKeyContext.tsx';
import { clearRoomSession } from '../utils/session.ts';
import styles from './SidebarContent.module.scss';

// Contents only — the shell renders this twice, once in the desktop sidebar and once in the
// mobile menu, each bringing its own container. Every dialog here carries its own trigger and
// open state, so neither container holds any.
interface SidebarContentProps {
  onNavigate?: () => void;
}

export const SidebarContent = ({ onNavigate }: SidebarContentProps) => {
  const navigate = useNavigate();
  const loggedUser = useSelector(selectLoggedUser);
  const [logout] = useLogoutMutation();
  const dispatch = useDispatch();
  const { clear } = useRoomKeyContext();
  const { inviteCode, action } = useEntryHandoff();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // the local session is dropped either way
    }
    dispatch(clearUser());
    clear();
    clearRoomSession();
    onNavigate?.();
    navigate('/');
  };

  return (
    <>
      <CreateRoomDialog
        trigger={<AppButton variant="transparent">Create room</AppButton>}
        defaultOpen={action === 'create'}
      />

      <JoinRoomDialog
        trigger={<AppButton variant="slate">Join room</AppButton>}
        defaultOpen={action === 'join'}
        inviteCode={inviteCode}
      />

      <span className={styles.sectionLabel}>{loggedUser ? 'Your rooms' : 'Recent'}</span>
      {loggedUser ? <SavedRoomsList /> : <RecentRoomsList />}
      <div className={styles.spacer} />

      {loggedUser ? (
        <AppButton onClick={handleLogout}>Logout</AppButton>
      ) : (
        <AuthDialog trigger={<AppButton>Log in</AppButton>} />
      )}
    </>
  );
};
