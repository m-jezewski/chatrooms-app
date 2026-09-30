import { Outlet, useNavigate, useSearchParams } from 'react-router';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppButton } from './AppButton.tsx';
import { RecentRoomsList } from '../features/rooms/RecentRoomsList.tsx';
import { SavedRoomsList } from '../features/rooms/SavedRoomsList.tsx';
import { CreateRoomModal } from '../features/rooms/CreateRoomModal.tsx';
import { JoinRoomModal } from '../features/rooms/JoinRoomModal.tsx';
import { AuthModal } from '../features/auth/AuthModal.tsx';
import { useLogoutMutation } from '../services/authApi.ts';
import { clearUser, selectLoggedUser } from '../features/auth/authSlice.ts';
import { useRoomKeyContext } from '../features/chatrooms/RoomKeyContext.tsx';
import { clearRoomSession } from '../utils/session.ts';
import styles from './AppLayout.module.scss';

type ShellModal = 'create' | 'join' | 'auth';

interface SidebarContentProps {
  onOpenModal: (modal: ShellModal) => void;
  onNavigate?: () => void;
}

const SidebarContent = ({ onOpenModal, onNavigate }: SidebarContentProps) => {
  const navigate = useNavigate();
  const loggedUser = useSelector(selectLoggedUser);
  const [logout] = useLogoutMutation();
  const dispatch = useDispatch();
  const { clear } = useRoomKeyContext();

  const open = (modal: ShellModal) => {
    onOpenModal(modal);
    onNavigate?.();
  };

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
      <AppButton variant="transparent" onClick={() => open('create')}>Create room</AppButton>
      <AppButton variant="slate" onClick={() => open('join')}>Join room</AppButton>
      <span className={styles.sectionLabel}>{loggedUser ? 'Saved' : 'Recent'}</span>
      {loggedUser ? <SavedRoomsList /> : <RecentRoomsList />}
      <div className={styles.spacer} />
      {loggedUser ? (
        <AppButton onClick={handleLogout}>Logout</AppButton>
      ) : (
        <AppButton onClick={() => open('auth')}>Log in</AppButton>
      )}
    </>
  );
};

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openModal, setOpenModal] = useState<ShellModal | null>(null);
  const [inviteCode, setInviteCode] = useState<string | undefined>(undefined);
  const [searchParams, setSearchParams] = useSearchParams();
  const closeMobile = () => setMobileMenuOpen(false);

  const closeModal = () => {
    setOpenModal(null);
    setInviteCode(undefined);
  };

  useEffect(() => {
    const requested = searchParams.get('modal');
    if (requested !== 'create' && requested !== 'join') return;

    setOpenModal(requested);
    setInviteCode(searchParams.get('code') ?? undefined);

    const rest = new URLSearchParams(searchParams);
    rest.delete('modal');
    rest.delete('code');
    setSearchParams(rest, { replace: true });
  }, [searchParams, setSearchParams]);

  return (
    <div className={styles.root}>
      <div className={styles.mobileHeader}>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={styles.toggleButton}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" d={!mobileMenuOpen ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12'} />
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuHeader}>
            <button onClick={closeMobile} className={styles.closeButton}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.closeIcon}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SidebarContent onOpenModal={setOpenModal} onNavigate={closeMobile} />
        </div>
      )}

      <div className={styles.sidebar}>
        <div className={styles.sidebarNav}>
          <SidebarContent onOpenModal={setOpenModal} />
        </div>
      </div>
      <main className={styles.main}>
        <Outlet />
      </main>

      {openModal === 'create' && <CreateRoomModal isOpen closeModal={closeModal} />}
      {openModal === 'join' && <JoinRoomModal isOpen closeModal={closeModal} inviteCode={inviteCode} />}
      {openModal === 'auth' && <AuthModal isOpen closeModal={closeModal} />}
    </div>
  );
};
