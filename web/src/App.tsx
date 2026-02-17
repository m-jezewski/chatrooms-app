import './App.css'
import {Navigate, Route, Routes} from "react-router";
import {AuthLayout} from "./features/auth/AuthLayout.tsx";
import {Login} from "./features/auth/Login.tsx";
import {Register} from "./features/auth/Register.tsx";
import React from "react";
import {Toaster} from "react-hot-toast";
import {Loader} from "./shared/Loader.tsx";
import {LoggedUserLayout} from "./shared/LoggedUserLayout.tsx";
import {Chatrooms} from "./features/chatrooms/Chatrooms.tsx";
import {Users} from "./features/users/Users.tsx";
import {useStatusQuery} from "./services/authApi.ts";
import {GuestRoute} from "./shared/GuestRoute.tsx";
import {ProtectedRoute} from "./shared/ProtectedRoute.tsx";

function App() {
    const {isLoading} = useStatusQuery();

    if (isLoading) {
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
                <Route element={<GuestRoute/>}>
                    <Route element={<AuthLayout/>}>
                        <Route path="/" element={<Login/>}/>
                        <Route path="register" element={<Register/>}/>
                    </Route>
                </Route>
                <Route element={<ProtectedRoute/>}>
                    <Route element={<LoggedUserLayout/>}>
                        <Route path="chatrooms" element={<Chatrooms/>}/>
                        <Route path="chatrooms/:id" element={<Chatrooms/>}/>
                    </Route>
                </Route>
                <Route element={<ProtectedRoute requiredRole="ADMIN"/>}>
                    <Route element={<LoggedUserLayout/>}>
                        <Route path="dashboard" element={<Users/>}/>
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
        </>
    )
}

export default App
