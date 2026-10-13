import { Navigate, Outlet, useMatch } from 'react-router';
import { useSelector } from 'react-redux';
import { AppButton } from './AppButton.tsx';
import { AppIcon } from './AppIcon.tsx';
import ArrowLeftIcon from '../assets/icons/arrow-left.svg?react';
import { EntryAction, getPathWithParams } from './entryHandoff.ts';
import { selectLoggedUser } from '../features/auth/authSlice.ts';
import styles from './EntryLayout.module.scss';

export const EntryLayout = () => {
  const loggedUser = useSelector(selectLoggedUser);
  const createMatch = useMatch('/create');
  const joinMatch = useMatch('/join');
  const joinCodeMatch = useMatch('/join/:inviteCode');
  const titleMatch = useMatch('/');

  if (loggedUser) {
    const action: EntryAction | null = createMatch ? 'create' : joinMatch || joinCodeMatch ? 'join' : null;

    return <Navigate to={getPathWithParams({ action, inviteCode: joinCodeMatch?.params.inviteCode })} replace />;
  }

  return (
    <main className={styles.layout}>
      <div className={styles.authBar}>
        <AppButton as="link" to="/login" variant="transparent">
          Sign in
        </AppButton>
        <AppButton as="link" to="/register" variant="purple">
          Register
        </AppButton>
      </div>
      <Outlet />
      {!titleMatch && (
        <div className={styles.backRow}>
          <AppButton as="link" to="/" variant="transparent" className={styles.backButton}>
            <AppIcon icon={ArrowLeftIcon} className={styles.backArrow} />
            Back to home
          </AppButton>
        </div>
      )}
    </main>
  );
};
