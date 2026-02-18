import { Form, Formik, FormikHelpers } from 'formik';
import { array, object, string } from 'yup';
import { InputLabel } from '../../shared/InputLabel.tsx';
import { TextInput } from '../../shared/TextInput.tsx';
import { ListboxInput } from '../../shared/ListboxInput.tsx';
import { AppButton } from '../../shared/AppButton.tsx';
import React from 'react';
import { Chatroom, User } from '../../interfaces.ts';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../shared/getErrorMessage.ts';
import { useUpdateChatroomMutation } from '../../services/chatroomsApi.ts';
import { useGetUsersQuery } from '../../services/usersApi.ts';

interface EditChatroomFormProps {
  initialValues: Chatroom
  closeModal: () => void;
  onSuccess?: () => void;
}

interface EditChatroomFormState {
  users: User[],
  name: string,
}

export const EditChatroomForm = ({ initialValues, closeModal, onSuccess }: EditChatroomFormProps) => {
  const [updateChatroom] = useUpdateChatroomMutation();
  const { data: users = [] } = useGetUsersQuery();

  const initialUsers = users.filter(u => initialValues.users.some(user => user.id === u.id));

  const handleSubmit = async (values: EditChatroomFormState, formikHelpers: FormikHelpers<EditChatroomFormState>) => {
    const { users, name } = values;
    const userIds = users.map(u => u.id);
    try {
      await updateChatroom({
        name,
        users: userIds,
        id: initialValues.id,
      }).unwrap();
      toast.success('Successfully edited chatroom!');
      onSuccess && onSuccess();
    } catch (error) {
      toast.error('Failed to edit chatroom. ' + (getErrorMessage(error) || ''));
    }
    formikHelpers.resetForm();
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        name: initialValues.name,
        users: initialUsers,
      }}
      validationSchema={object({
        name: string()
          .required()
          .min(3).max(50),
        users: array().min(1),
      })}
      onSubmit={handleSubmit}
    >
      {() => (
        <Form className={'w-full flex flex-col gap-4 min-w-80'}>
          <div>
            <InputLabel htmlFor={'name'}>Channel name</InputLabel>
            <TextInput name={'name'} type={'name'} placeholder={'Channel name'} />
          </div>
          <div>
            <InputLabel htmlFor={'users'}>Users</InputLabel><br />
            <ListboxInput name={'users'} disableSelf={false} />
          </div>
          <div className="flex gap-4 justify-end">
            <AppButton onClick={() => closeModal()}>Cancel</AppButton>
            <AppButton variant={'purple'} type={'submit'}>Edit</AppButton>
          </div>
        </Form>
      )}
    </Formik>
  );
};
