import {Outlet} from "react-router";
import styles from "./AuthLayout.module.scss";


export const AuthLayout = () => {
    return (
        <main className={styles.layout}>
            <h2 className={styles.logo}>Chatrooms</h2>
            <Outlet />
        </main>
    )
}