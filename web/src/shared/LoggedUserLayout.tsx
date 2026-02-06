import {Link, Outlet} from "react-router";
import {selectLoggedUser} from "../features/auth/authSlice.ts";
import {useDispatch, useSelector} from "react-redux";
import {AppButton} from "./AppButton.tsx";
import {ChatroomFormModal} from "../features/chatrooms/ChatroomFormModal.tsx";
import React, {useState} from "react";
import {ChatroomList} from "../features/chatrooms/ChatroomList.tsx";
import {AppDispatch} from "../store.ts";
import {logoutAction} from "../features/auth/authActions.ts";


export const LoggedUserLayout = () => {
    const user = useSelector(selectLoggedUser);
    const dispatch = useDispatch<AppDispatch>();
    const [isOpen, setIsOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


    return (
        <div
            className={"flex flex-row items-stretch h-screen w-screen bg-gradient-to-tr from-slate-900 to-neutral-900 relative"}>

            <div className="md:hidden fixed flex justify-between items-center p-4 pt-12  md:border-b border-purple-950">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-3 shadow-slate-700 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d={!mobileMenuOpen ? "M4 6h16M4 12h16M4 18h16" : "M6 18L18 6M6 6l12 12"} />
                    </svg>
                </button>
            </div>


            {mobileMenuOpen && (
                <div className="absolute top-0 left-0 w-full h-full bg-slate-900 bg-opacity-95 z-50 flex flex-col p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-white text-2xl select-none">Chatrooms</h2>
                        <button onClick={() => setMobileMenuOpen(false)} className="text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {user?.role === "ADMIN" && (
                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                            <div className="text-center p-2 bg-white/5 text-white mb-4">Users</div>
                        </Link>
                    )}
                    <AppButton className={"mb-4"} onClick={() => {dispatch(logoutAction()); setMobileMenuOpen(false)}}>Logout</AppButton>
                    <AppButton variant={'purple'} className={"mb-4"} onClick={() => {setIsOpen(true); setMobileMenuOpen(false)}}>Add chatroom</AppButton>
                    <ChatroomList/>
                </div>
            )}

            <div className={"hidden md:flex basis-1/5 max-w-72 min-w-52 overflow-y-auto from-slate-900 to-neutral-900 flex-col p-3"}>
                <Link to={'/chatrooms'}><h2
                    className={"text-left text-white landingLogo text-2xl select-none p-4 border-b-2 border-purple-950 w-full"}>Chatrooms</h2>
                </Link>
                <div className="flex flex-col gap-4 mt-4">
                    {user?.role === "ADMIN" && <Link to="/dashboard">
                        <div className={"text-center p-2 bg-white/5"}>
                            Users
                        </div>
                    </Link>}
                    <AppButton className={""} onClick={() => dispatch(logoutAction())}>Logout</AppButton>
                    <AppButton variant={'purple'} onClick={() => setIsOpen(true)}>Add chatroom</AppButton>
                    <ChatroomList/>
                </div>
            </div>
            <main className={"basis-4/5 grow from-slate-800 to-neutral-900 bg-gradient-to-tr"}>
                <Outlet/>
            </main>
            <ChatroomFormModal
                closeModal={() => setIsOpen(false)}
                isOpen={isOpen}
            />
        </div>
    )
}