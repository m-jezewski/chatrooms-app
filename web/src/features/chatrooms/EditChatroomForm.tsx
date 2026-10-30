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
import { ERROR_MESSAGES, failureMessage } from '../../shared/requestError.ts';
import { useUpdateChatroomMutation } from '../../services/chatroomsApi.ts';
import { getOwnerToken } from '../../utils/session.ts';

interface EditChatroomFormProps {
  initialValues: Chatroom;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EditChatroomFormValues {
  name: string;
}

export const EditChatroomForm = ({ initialValues, onClose, onSuccess }: EditChatroomFormProps) => {
  const [updateChatroom] = useUpdateChatroomMutation();

  const handleSubmit = async (values: EditChatroomFormValues, formikHelpers: FormikHelpers<EditChatroomFormValues>) => {
    try {
      await updateChatroom({
        id: initialValues.id,
        name: values.name,
        ownerToken: getOwnerToken(initialValues.id),
      }).unwrap();
      toast.success('Successfully edited the room!');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(
        failureMessage(error, 'Failed to edit the room.', {
          403: ERROR_MESSAGES.OWNER_ONLY,
          404: ERROR_MESSAGES.ROOM_IS_GONE,
        }),
      );
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
            <AppButton onClick={onClose}>Cancel</AppButton>
            <AppButton variant={'purple'} type={'submit'}>
              Save
            </AppButton>
          </FormActions>
        </FormContainer>
      )}
    </Formik>
  );
};
