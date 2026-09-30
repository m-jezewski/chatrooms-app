import styles from './App.module.scss';
import { Navigate, Route, Routes } from 'react-router';
import { Login } from './features/auth/Login.tsx';
import { Register } from './features/auth/Register.tsx';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Loader } from './shared/Loader.tsx';
import { EntryLayout } from './shared/EntryLayout.tsx';
import { AppLayout } from './shared/AppLayout.tsx';
import { Chatrooms } from './features/chatrooms/Chatrooms.tsx';
import { HomePage } from './features/rooms/HomePage.tsx';
import { CreateRoomPage } from './features/rooms/CreateRoomPage.tsx';
import { JoinRoomPage } from './features/rooms/JoinRoomPage.tsx';
import { useStatusQuery } from './services/authApi.ts';

function App() {
  const { isLoading } = useStatusQuery();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Loader variant={'large'} />
      </div>
    );
  }

  return (
    <>
      <Toaster position={'top-right'} toastOptions={{ style: { fontSize: '0.85rem' } }} />
      <Routes>
        <Route element={<EntryLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="create" element={<CreateRoomPage />} />
          <Route path="join" element={<JoinRoomPage />} />
          <Route path="join/:inviteCode" element={<JoinRoomPage />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route path="chatrooms" element={<Chatrooms />} />
          <Route path="chatrooms/:roomId" element={<Chatrooms />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
