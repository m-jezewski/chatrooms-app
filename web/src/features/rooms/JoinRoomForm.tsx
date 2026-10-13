import React, { useEffect, useState } from 'react';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import { useNavigate } from 'react-router';
import { InputLabel } from '../../shared/InputLabel.tsx';
import { TextInput } from '../../shared/TextInput.tsx';
import { AppButton } from '../../shared/AppButton.tsx';
import { FormActions } from '../../shared/FormActions.tsx';
import { FormContainer } from '../../shared/FormContainer.tsx';
import { useJoinChatroomMutation, useLazyGetRoomByInviteCodeQuery } from '../../services/chatroomsApi.ts';
import { base64ToUint8, deriveRoomSecrets } from '../../utils/roomCrypto.ts';
import { saveNickname } from '../../utils/session.ts';
import { recordRecentRoom } from '../../utils/recentRooms.ts';
import { useRoomKeyContext } from '../chatrooms/RoomKeyContext.tsx';
import { RoomLocator } from '../../interfaces.ts';
import styles from './JoinRoomForm.module.scss';

interface JoinRoomFormProps {
  inviteCode?: string;
  onRoomResolved?: (room: RoomLocator) => void;
  onJoined?: () => void;
  onCancel?: () => void;
}

export const JoinRoomForm = ({ inviteCode, onRoomResolved, onJoined, onCancel }: JoinRoomFormProps) => {
  const navigate = useNavigate();
  const { setKey } = useRoomKeyContext();
  const [lookupRoom] = useLazyGetRoomByInviteCodeQuery();
  const [joinChatroom] = useJoinChatroomMutation();
  const [locator, setLocator] = useState<RoomLocator | null>(null);

  const resolveCode = async (code: string, helpers?: FormikHelpers<{ inviteCode: string }>) => {
    try {
      const room = await lookupRoom(code.trim().toUpperCase()).unwrap();
      setLocator(room);
      onRoomResolved?.(room);
    } catch {
      helpers?.setFieldError('inviteCode', 'No room found for this code');
    }
    helpers?.setSubmitting(false);
  };

  useEffect(() => {
    if (inviteCode) {
      void resolveCode(inviteCode);
    }
  }, [inviteCode]);

  const handleUnlock = async (
    values: { password: string; nickname: string },
    helpers: FormikHelpers<{ password: string; nickname: string }>,
  ) => {
    if (!locator) return;
    const secrets = await deriveRoomSecrets(values.password, base64ToUint8(locator.salt));

    try {
      await joinChatroom({ channelId: locator.roomId, authKey: secrets.authKey }).unwrap();
    } catch (error) {
      const status = (error as { status?: number | string })?.status;
      helpers.setFieldError(
        'password',
        status === 429 ? 'Too many attempts — try again in a minute' : 'Incorrect password',
      );
      helpers.setSubmitting(false);
      return;
    }

    if (values.nickname.trim()) saveNickname(values.nickname.trim());
    setKey(locator.roomId, secrets);
    recordRecentRoom({ roomId: locator.roomId, name: locator.name });
    navigate(`/chatrooms/${locator.roomId}`);
    onJoined?.();
  };

  if (!locator) {
    return (
      <Formik
        initialValues={{ inviteCode: inviteCode ?? '' }}
        validationSchema={object({ inviteCode: string().required('Enter an invite code') })}
        onSubmit={({ inviteCode: code }, helpers) => resolveCode(code, helpers)}
      >
        {({ isSubmitting }) => (
          <FormContainer>
            <div>
              <InputLabel htmlFor="inviteCode">Invite code</InputLabel>
              <TextInput name="inviteCode" type="text" placeholder="e.g. K7QF9M2X" autoFocus />
            </div>
            {onCancel ? (
              <FormActions equalWidth>
                <AppButton type="button" onClick={onCancel}>
                  Cancel
                </AppButton>
                <AppButton variant="purple" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Looking up…' : 'Find room'}
                </AppButton>
              </FormActions>
            ) : (
              <AppButton variant="purple" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Looking up…' : 'Find room'}
              </AppButton>
            )}
          </FormContainer>
        )}
      </Formik>
    );
  }

  return (
    <>
      <p className={styles.muted}>Enter the room password to decrypt messages. It never leaves your browser.</p>
      <Formik
        initialValues={{ password: '', nickname: '' }}
        validationSchema={object({ password: string().required('Password is required') })}
        onSubmit={handleUnlock}
      >
        {({ isSubmitting }) => (
          <FormContainer>
            <div>
              <InputLabel htmlFor="password">Room password</InputLabel>
              <TextInput name="password" type="password" placeholder="Room password" autoFocus />
            </div>
            <div>
              <InputLabel htmlFor="nickname">Nickname (optional)</InputLabel>
              <TextInput name="nickname" type="text" placeholder="Shown to others in the room" />
            </div>
            {onCancel ? (
              <FormActions equalWidth>
                <AppButton type="button" onClick={onCancel}>
                  Cancel
                </AppButton>
                <AppButton variant="purple" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Joining…' : 'Join room'}
                </AppButton>
              </FormActions>
            ) : (
              <AppButton variant="purple" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Joining…' : 'Join room'}
              </AppButton>
            )}
          </FormContainer>
        )}
      </Formik>
    </>
  );
};
