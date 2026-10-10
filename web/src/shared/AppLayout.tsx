import { Outlet } from 'react-router';
import React, { useState } from 'react';
import { AppIcon } from './AppIcon.tsx';
import CloseIcon from '../assets/icons/close.svg?react';
import MenuIcon from '../assets/icons/menu.svg?react';
import { SidebarContent } from './SidebarContent.tsx';
import styles from './AppLayout.module.scss';

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <div className={styles.root}>
      <div className={styles.mobileHeader}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={styles.toggleButton}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <AppIcon icon={mobileMenuOpen ? CloseIcon : MenuIcon} className={styles.icon} />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuHeader}>
            <button onClick={closeMobile} className={styles.closeButton} aria-label="Close menu">
              <AppIcon icon={CloseIcon} className={styles.closeIcon} />
            </button>
          </div>
          <SidebarContent onNavigate={closeMobile} />
        </div>
      )}

      <div className={styles.sidebar}>
        <div className={styles.sidebarNav}>
          <SidebarContent />
        </div>
      </div>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};
