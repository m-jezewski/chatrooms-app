import './App.css'
import {Navigate, Route, Routes, useNavigate} from "react-router";
import {AuthLayout} from "./features/auth/AuthLayout.tsx";
import {Login} from "./features/auth/Login.tsx";
import {Register} from "./features/auth/Register.tsx";
import React, {useEffect, useState} from "react";
import {Toaster} from "react-hot-toast";
import {useDispatch, useSelector, useStore} from "react-redux";
import {selectLoggedUser} from "./features/auth/authSlice.ts";
import {statusAction} from "./features/auth/authActions.ts";
import {AppDispatch} from "./store.ts";
import {Loader} from "./shared/Loader.tsx";
import {LoggedUserLayout} from "./shared/LoggedUserLayout.tsx";
import {Chatrooms} from "./features/chatrooms/Chatrooms.tsx";
import {Users} from "./features/users/Users.tsx";

function App() {
    const [appLoader, setAppLoader] = useState(true)
    const dispatch = useDispatch<AppDispatch>();

    const checkUserStatus = async () => {
        setAppLoader(true)
        const res = await dispatch(statusAction())
        setAppLoader(false)
    }

    useEffect(() => {
        checkUserStatus()
    }, [])


    const user = useSelector(selectLoggedUser)

    if (appLoader) {
        return (
            <div className={"flex items-center justify-center w-screen min-h-screen mx-auto bg-blue-950"}>
                <Loader variant={'large'}/>
            </div>
        )
    }

    return (
        <>
            <Toaster position={'top-right'} toastOptions={{style: {fontSize: '0.85rem'}}}/>
            <Routes>
                <Route element={<AuthLayout/>}>
                    <Route index path="/" element={user ? <Navigate to={"/chatrooms/"} /> : <Login/>}/>
                    <Route path="register" element={<Register/>}/>
                </Route>
                {user && <Route element={<LoggedUserLayout/>}>
                    <Route path={"chatrooms/"} element={<Chatrooms/>}/>
                    <Route path={"chatrooms/:id"} element={<Chatrooms/>}/>
                    {user.role === "ADMIN" && <>
                        <Route path={"dashboard"} element={<Users/>}/>
                    </>}
                </Route>}
                <Route path={"*"} element={<Navigate to="/"/>} />
            </Routes>
        </>
    )
}

export default App
