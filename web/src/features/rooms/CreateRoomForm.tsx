import React, { useState } from 'react';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { InputLabel } from '../../shared/InputLabel.tsx';
import { TextInput } from '../../shared/TextInput.tsx';
import { SelectInput } from '../../shared/SelectInput.tsx';
import { AppButton } from '../../shared/AppButton.tsx';
import { FormActions } from '../../shared/FormActions.tsx';
import { FormContainer } from '../../shared/FormContainer.tsx';
import { selectLoggedUser } from '../auth/authSlice.ts';
import { useCreateChatroomMutation } from '../../services/chatroomsApi.ts';
import { deriveRoomSecrets, generateSalt, uint8ToBase64 } from '../../utils/roomCrypto.ts';
import { saveOwnerToken } from '../../utils/session.ts';
import { recordRecentRoom } from '../../utils/recentRooms.ts';
import { useRoomKeyContext } from '../chatrooms/RoomKeyContext.tsx';
import { getErrorMessage } from '../../shared/getErrorMessage.ts';
import { passwordStrength } from '../../utils/passwordStrength.ts';
import { DEFAULT_TTL_MS, expiresAtFrom, ttlOptionsFor } from '../../utils/ttl.ts';
import styles from './CreateRoomForm.module.scss';

interface CreateRoomFormValues {
  name: string;
  password: string;
  ttl: number | null;
}

interface CreateRoomFormProps {
  onCreated?: () => void;
  onEntered?: () => void;
  onCancel?: () => void;
}

interface CreatedInfo {
  roomId: string;
  inviteCode: string;
  ownerToken?: string;
}

export const CreateRoomForm = ({ onCreated, onEntered, onCancel }: CreateRoomFormProps) => {
  const navigate = useNavigate();
  const loggedUser = useSelector(selectLoggedUser);
  const [createChatroom] = useCreateChatroomMutation();
  const { setKey } = useRoomKeyContext();
  const [created, setCreated] = useState<CreatedInfo | null>(null);

  const ttlOptions = ttlOptionsFor(!!loggedUser);

  const handleSubmit = async (values: CreateRoomFormValues, helpers: FormikHelpers<CreateRoomFormValues>) => {
    const expiresAt = expiresAtFrom(values.ttl);

    try {
      const salt = generateSalt();
      const secrets = await deriveRoomSecrets(values.password, salt);

      const room = await createChatroom({
        name: values.name,
        salt: uint8ToBase64(salt),
        authKey: secrets.authKey,
        expiresAt,
      }).unwrap();

      if (room.ownerToken) {
        saveOwnerToken(room.id, room.ownerToken);
      }
      setKey(room.id, secrets); // the server marked the creator's session as joined on create
      recordRecentRoom({ roomId: room.id, name: room.name });
      setCreated({ roomId: room.id, inviteCode: room.inviteCode, ownerToken: room.ownerToken });
      onCreated?.();
    } catch (error) {
      toast.error('Failed to create room. ' + (getErrorMessage(error) || ''));
    }
    helpers.setSubmitting(false);
  };

  if (created) {
    const inviteLink = `${window.location.origin}/join/${created.inviteCode}`;
    const enterRoom = () => {
      navigate(`/chatrooms/${created.roomId}`);
      onEntered?.();
    };

    return (
      <>
        <p className={styles.muted}>Share the link or code — anyone with it plus the password can join.</p>

        <InputLabel>Invite link</InputLabel>
        <div className={styles.copyRow}>
          <code className={styles.code}>{inviteLink}</code>
          <AppButton type="button" onClick={() => navigator.clipboard?.writeText(inviteLink)}>Copy</AppButton>
        </div>

        <InputLabel>Invite code</InputLabel>
        <div className={styles.copyRow}>
          <code className={styles.code}>{created.inviteCode}</code>
          <AppButton type="button" onClick={() => navigator.clipboard?.writeText(created.inviteCode)}>Copy</AppButton>
        </div>

        {created.ownerToken && (
          <div className={styles.tokenWarning}>
            <strong>Owner token (shown once):</strong>
            <code className={styles.code}>{created.ownerToken}</code>
            <p className={styles.muted}>
              Kept in this tab for managing the room. Closing the tab drops management — the room still
              expires on its own.
            </p>
          </div>
        )}

        <AppButton variant="purple" type="button" onClick={enterRoom}>Enter room</AppButton>
      </>
    );
  }

  return (
    <Formik<CreateRoomFormValues>
      initialValues={{ name: '', password: '', ttl: DEFAULT_TTL_MS }}
      validationSchema={object({
        name: string().required().min(3).max(50),
        password: string().required('Password is required').min(8, 'Use at least 8 characters'),
      })}
      onSubmit={handleSubmit}
    >
      {({ values, isSubmitting }) => {
        const strength = passwordStrength(values.password);
        return (
          <FormContainer>
            <div>
              <InputLabel htmlFor="name">Room name</InputLabel>
              <TextInput name="name" type="text" placeholder="Room name" />
            </div>
            <div>
              <InputLabel htmlFor="password">Room password</InputLabel>
              <TextInput name="password" type="password" placeholder="Room password" />
              {values.password && (
                <div className={styles.meter} aria-label={`Password strength: ${strength.label}`}>
                  <div className={styles.meterTrack}>
                    <div className={styles[`meterFill${strength.score}`]} />
                  </div>
                  <span className={styles.meterLabel}>{strength.label}</span>
                </div>
              )}
              <p className={styles.hint}>
                Use a long passphrase for stronger encryption.
              </p>
            </div>
            <div>
              <InputLabel htmlFor="ttl">Expires</InputLabel>
              <SelectInput name="ttl" options={ttlOptions} />
            </div>
            {onCancel ? (
              <FormActions equalWidth>
                <AppButton type="button" onClick={onCancel}>Cancel</AppButton>
                <AppButton variant="purple" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating…' : 'Create room'}
                </AppButton>
              </FormActions>
            ) : (
              <AppButton variant="purple" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Create room'}
              </AppButton>
            )}
          </FormContainer>
        );
      }}
    </Formik>
  );
};
