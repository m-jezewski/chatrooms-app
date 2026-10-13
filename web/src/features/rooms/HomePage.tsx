import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppButton } from '../../shared/AppButton.tsx';
import styles from './HomePage.module.scss';

export const HomePage = () => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');

  const handleJoin = () => {
    const code = inviteCode.trim().toUpperCase();
    navigate(code ? `/join/${code}` : '/join');
  };

  return (
    <div className={styles.wrapper}>
      <p className={styles.tagline}>
        Anonymous, end-to-end encrypted chatrooms.
        <br />
        No account needed.
      </p>
      <div className={styles.card}>
        <div className={styles.block}>
          <AppButton as="link" to="/create" variant="purple" className={styles.createBtn}>
            Create a room
          </AppButton>

          <span className={styles.joinLabel}>or join with an invitation code</span>

          <form
            className={styles.joinRow}
            onSubmit={(event) => {
              event.preventDefault();
              handleJoin();
            }}
          >
            <input
              className={styles.codeInput}
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="e.g. K7QF9M2X"
              aria-label="Invitation code"
            />
            <AppButton variant="purple" type="submit">
              Join
            </AppButton>
          </form>
        </div>
      </div>
    </div>
  );
};
