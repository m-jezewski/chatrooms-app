import React from 'react';
import { EditUserForm } from './EditUserForm.tsx';
import { CreateUserForm } from './CreateUserForm.tsx';
import { User } from '../../interfaces.ts';
import { AppModal } from '../../shared/AppModal.tsx';

export const UserFormModal = ({ initialValues, isEditing, isOpen, closeModal }: {
  initialValues: User | null,
  isEditing: boolean,
  isOpen: boolean,
  closeModal: () => void
}) => {
  const title = isEditing ? 'Edit user' : 'Add new user';

  return (
    <AppModal
      title={title}
      isOpen={isOpen}
      onClose={closeModal}
    >
      test
      {isEditing && initialValues ?
        <EditUserForm
          initialValues={initialValues}
          closeModal={closeModal}
        /> :
        <CreateUserForm
          closeModal={closeModal}
        />}
    </AppModal>
  );
};