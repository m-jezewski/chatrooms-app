import {Link, Outlet} from "react-router";
import {AppButton} from "./AppButton.tsx";
import {CreateChatroomFormModal} from "../features/chatrooms/CreateChatroomFormModal.tsx";
import React, {useState} from "react";
import {ChatroomList} from "../features/chatrooms/ChatroomList.tsx";
import {useLogoutMutation} from "../services/authApi.ts";
import styles from "./LoggedUserLayout.module.scss";

const SidebarContent = ({onLogout, onAddChatroom}: {
    onLogout: () => void;
    onAddChatroom: () => void;
}) => {
    return (
        <>
            <AppButton onClick={onLogout}>Logout</AppButton>
            <AppButton variant={'purple'} onClick={onAddChatroom}>Add chatroom</AppButton>
            <ChatroomList/>
        </>
    );
};

export const LoggedUserLayout = () => {
    const [logout] = useLogoutMutation();
    const [isOpen, setIsOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const closeMobile = () => setMobileMenuOpen(false);

    return (
        <div className={styles.root}>

            <div className={styles.mobileHeader}>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={styles.toggleButton}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={!mobileMenuOpen ? "M4 6h16M4 12h16M4 18h16" : "M6 18L18 6M6 6l12 12"} />
                    </svg>
                </button>
            </div>

            {mobileMenuOpen && (
                <div className={styles.mobileMenu}>
                    <div className={styles.mobileMenuHeader}>
                        <h2 className={styles.mobileTitle}>Chatrooms</h2>
                        <button onClick={closeMobile} className={styles.closeButton}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.closeIcon}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <SidebarContent
                        onLogout={() => { logout(); closeMobile(); }}
                        onAddChatroom={() => { setIsOpen(true); closeMobile(); }}
                    />
                </div>
            )}

            <div className={styles.sidebar}>
                <Link to={'/chatrooms'}><h2 className={styles.sidebarLogo}>Chatrooms</h2>
                </Link>
                <div className={styles.sidebarNav}>
                    <SidebarContent
                        onLogout={() => logout()}
                        onAddChatroom={() => setIsOpen(true)}
                    />
                </div>
            </div>
            <main className={styles.main}>
                <Outlet/>
            </main>
            <CreateChatroomFormModal
                closeModal={() => setIsOpen(false)}
                isOpen={isOpen}
            />
        </div>
    )
}