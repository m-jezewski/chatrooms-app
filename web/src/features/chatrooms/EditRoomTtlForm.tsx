import React from 'react';
import { Formik, FormikHelpers } from 'formik';
import toast from 'react-hot-toast';
import { InputLabel } from '../../shared/InputLabel.tsx';
import { AppButton } from '../../shared/AppButton.tsx';
import { FormActions } from '../../shared/FormActions.tsx';
import { FormContainer } from '../../shared/FormContainer.tsx';
import { SelectInput } from '../../shared/SelectInput.tsx';
import { Chatroom } from '../../interfaces.ts';
import { getErrorMessage } from '../../shared/getErrorMessage.ts';
import { useUpdateChatroomMutation } from '../../services/chatroomsApi.ts';
import { getOwnerToken } from '../../utils/session.ts';
import { DEFAULT_TTL_MS, expiresAtFrom, formatExpiry, ttlOptionsFor } from '../../utils/ttl.ts';
import styles from './EditRoomTtlForm.module.scss';

interface EditRoomTtlFormProps {
  room: Chatroom;
  closeModal: () => void;
}

interface EditRoomTtlFormValues {
  ttl: number | null;
}

export const EditRoomTtlForm = ({ room, closeModal }: EditRoomTtlFormProps) => {
  const [updateChatroom] = useUpdateChatroomMutation();
  const isAccountOwned = !!room.ownerId;
  const options = ttlOptionsFor(isAccountOwned);

  const handleSubmit = async (values: EditRoomTtlFormValues, formikHelpers: FormikHelpers<EditRoomTtlFormValues>) => {
    try {
      await updateChatroom({
        id: room.id,
        expiresAt: expiresAtFrom(values.ttl),
        ownerToken: getOwnerToken(room.id),
      }).unwrap();
      toast.success('Room expiry updated!');
      closeModal();
    } catch (error) {
      toast.error('Failed to update the expiry. ' + (getErrorMessage(error) || ''));
    }
    formikHelpers.setSubmitting(false);
  };

  return (
    <Formik<EditRoomTtlFormValues>
      initialValues={{ ttl: room.expiresAt === null && isAccountOwned ? null : DEFAULT_TTL_MS }}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <FormContainer>
          <p className={styles.current}>
            Currently expires: <strong>{formatExpiry(room.expiresAt)}</strong>
          </p>
          <div>
            <InputLabel htmlFor="ttl">Expires</InputLabel>
            <SelectInput name="ttl" options={options} />
            <p className={styles.hint}>
              Counted from now — saving restarts the countdown.
              {!isAccountOwned && ' An anonymous room can live at most 30 days.'}
            </p>
          </div>
          <FormActions equalWidth>
            <AppButton type="button" onClick={closeModal}>
              Cancel
            </AppButton>
            <AppButton variant="purple" type="submit" disabled={isSubmitting}>
              Save
            </AppButton>
          </FormActions>
        </FormContainer>
      )}
    </Formik>
  );
};
