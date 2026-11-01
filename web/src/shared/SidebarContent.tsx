import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppButton } from './AppButton.tsx';
import { SidebarAction } from './SidebarAction.tsx';
import { useEntryHandoff } from './entryHandoff.ts';
import PlusIcon from '../assets/icons/plus.svg?react';
import EnterIcon from '../assets/icons/enter.svg?react';
import { RoomList } from '../features/rooms/RoomList.tsx';
import { CreateRoomDialog } from '../features/rooms/CreateRoomDialog.tsx';
import { JoinRoomDialog } from '../features/rooms/JoinRoomDialog.tsx';
import { AuthDialog } from '../features/auth/AuthDialog.tsx';
import { useLogoutMutation } from '../services/authApi.ts';
import { clearUser, selectLoggedUser } from '../features/auth/authSlice.ts';
import { useRoomKeyContext } from '../features/chatrooms/RoomKeyContext.tsx';
import { clearRoomSession } from '../utils/session.ts';
import styles from './SidebarContent.module.scss';

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
      <div className={styles.actions}>
        <CreateRoomDialog
          trigger={
            <SidebarAction icon={PlusIcon} variant="accent">
              New Room
            </SidebarAction>
          }
          defaultOpen={action === 'create'}
        />

        <JoinRoomDialog
          trigger={<SidebarAction icon={EnterIcon}>Join room</SidebarAction>}
          defaultOpen={action === 'join'}
          inviteCode={inviteCode}
        />
      </div>

      <RoomList />
      <div className={styles.spacer} />

      {loggedUser ? (
        <AppButton onClick={handleLogout}>Logout</AppButton>
      ) : (
        <AuthDialog trigger={<AppButton variant={'accent'}>Log in</AppButton>} />
      )}
    </>
  );
};
