import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import { InputLabel } from '../../shared/InputLabel.tsx';
import { TextInput } from '../../shared/TextInput.tsx';
import { AppButton } from '../../shared/AppButton.tsx';
import React from 'react';
import { FormActions } from '../../shared/FormActions.tsx';
import { FormContainer } from '../../shared/FormContainer.tsx';
import { Chatroom } from '../../interfaces.ts';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../shared/getErrorMessage.ts';
import { useUpdateChatroomMutation } from '../../services/chatroomsApi.ts';
import { getOwnerToken } from '../../utils/session.ts';

interface EditChatroomFormProps {
  initialValues: Chatroom;
  closeModal: () => void;
  onSuccess?: () => void;
}

interface EditChatroomFormState {
  name: string;
}

export const EditChatroomForm = ({ initialValues, closeModal, onSuccess }: EditChatroomFormProps) => {
  const [updateChatroom] = useUpdateChatroomMutation();

  const handleSubmit = async (values: EditChatroomFormState, formikHelpers: FormikHelpers<EditChatroomFormState>) => {
    try {
      await updateChatroom({
        id: initialValues.id,
        name: values.name,
        ownerToken: getOwnerToken(initialValues.id),
      }).unwrap();
      toast.success('Successfully edited the room!');
      onSuccess?.();
      closeModal();
    } catch (error) {
      toast.error('Failed to edit the room. ' + (getErrorMessage(error) || ''));
    }
    formikHelpers.resetForm();
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{ name: initialValues.name }}
      validationSchema={object({
        name: string().required().min(3).max(50),
      })}
      onSubmit={handleSubmit}
    >
      {() => (
        <FormContainer className="">
          <div>
            <InputLabel htmlFor={'name'}>Room name</InputLabel>
            <TextInput name={'name'} type={'text'} placeholder={'Room name'} />
          </div>
          <FormActions equalWidth>
            <AppButton onClick={() => closeModal()}>Cancel</AppButton>
            <AppButton variant={'purple'} type={'submit'}>
              Save
            </AppButton>
          </FormActions>
        </FormContainer>
      )}
    </Formik>
  );
};
