import {Outlet} from "react-router";


export const AuthLayout = () => {
    return (
        <main className={"flex flex-col items-center justify-center gap-16 h-screen w-screen bg-gradient-to-tr from-slate-900 to-neutral-900 relative"}>
            <h2 className={"text-center landingLogo text-5xl select-none"}>Chatrooms</h2>
            <Outlet />
        </main>
    )
}