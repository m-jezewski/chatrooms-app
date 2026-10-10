import { Outlet } from 'react-router';
import React, { useState } from 'react';
import { SidebarContent } from './SidebarContent.tsx';
import styles from './AppLayout.module.scss';

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobile = () => setMobileMenuOpen(false);

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
