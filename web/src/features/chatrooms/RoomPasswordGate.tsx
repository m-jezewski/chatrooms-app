import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import React from 'react';
import { InputLabel } from '../../shared/InputLabel.tsx';
import { TextInput } from '../../shared/TextInput.tsx';
import { AppButton } from '../../shared/AppButton.tsx';
import { FormContainer } from '../../shared/FormContainer.tsx';
import { RoomEntry } from '../../interfaces.ts';
import { base64ToUint8, deriveRoomSecrets, RoomSecrets } from '../../utils/roomCrypto.ts';
import { useJoinChatroomMutation } from '../../services/chatroomsApi.ts';
import styles from './RoomPasswordGate.module.scss';

interface RoomPasswordGateProps {
  entry: RoomEntry;
  onJoin: (secrets: RoomSecrets) => void;
}

interface RoomPasswordFormValues {
  password: string;
}

export const RoomPasswordGate = ({ entry, onJoin }: RoomPasswordGateProps) => {
  const [joinChatroom] = useJoinChatroomMutation();

  const handleSubmit = async (
    { password }: RoomPasswordFormValues,
    formikHelpers: FormikHelpers<RoomPasswordFormValues>,
  ) => {
    let secrets: RoomSecrets;
    try {
      secrets = await deriveRoomSecrets(password, base64ToUint8(entry.salt));
    } catch {
      formikHelpers.setFieldError('password', 'Could not unlock this room — its encryption data looks damaged');
      return;
    }

    try {
      await joinChatroom({ channelId: entry.roomId, authKey: secrets.authKey }).unwrap();
    } catch (error) {
      const status = (error as { status?: number | string })?.status;
      formikHelpers.setFieldError(
        'password',
        status === 429 ? 'Too many attempts — try again in a minute' : 'Incorrect password',
      );
      return;
    }

    onJoin(secrets);
  };

  return (
    <div className={styles.gate}>
      <Formik
        initialValues={{ password: '' }}
        validationSchema={object({ password: string().required('Password is required') })}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <FormContainer className={styles.form}>
            <div className={styles.intro}>
              <h2 className={styles.title}>This room is encrypted</h2>
              <p className={styles.hint}>Enter the room password to decrypt messages. It never leaves your browser.</p>
            </div>
            <div>
              <InputLabel htmlFor={'password'}>Room password</InputLabel>
              <TextInput name={'password'} type={'password'} placeholder={'Room password'} autoFocus />
            </div>
            <AppButton variant={'purple'} type={'submit'} disabled={isSubmitting}>
              {isSubmitting ? 'Joining…' : 'Join room'}
            </AppButton>
          </FormContainer>
        )}
      </Formik>
    </div>
  );
};
