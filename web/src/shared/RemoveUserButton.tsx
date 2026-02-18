import toast from 'react-hot-toast';
import { AppButton } from './AppButton.tsx';
import React from 'react';
import { useDeleteUserMutation } from '../services/usersApi.ts';
import { useSelector } from 'react-redux';
import { selectLoggedUser } from '../features/auth/authSlice.ts';

interface RemoveUserButtonProps {
  userId: number;
}

export const RemoveUserButton = ({userId}: RemoveUserButtonProps) => {
  const [deleteUser] = useDeleteUserMutation();
  const loggedUser = useSelector(selectLoggedUser);

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUser(id).unwrap()
      toast.success("User deleted successfully.")
    } catch (e) {
      toast.error("Something went wrong.")
    }
  }


  return (
    <AppButton
      disabled={userId === loggedUser?.id}
      onClick={() => handleDeleteUser(userId)}
      variant={'red'}
    >
      Delete
    </AppButton>
  )
}