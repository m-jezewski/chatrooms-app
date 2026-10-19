import { TextInput } from '../../shared/TextInput.tsx';
import { Form, Formik, FormikHelpers } from 'formik';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { AppButton } from '../../shared/AppButton.tsx';
import { AppIcon } from '../../shared/AppIcon.tsx';
import SendIcon from '../../assets/icons/send.svg?react';
import { useRoomKey } from '../chatrooms/RoomKeyContext.tsx';
import { selectJoinedChannelId } from '../chatrooms/roomMembershipSlice.ts';
import { messageSubmitted } from './messagesSlice.ts';
import { encrypt } from '../../utils/roomCrypto.ts';
import { getNickname, getSenderId } from '../../utils/session.ts';
import { RootState } from '../../store.ts';
import styles from './MessageForm.module.scss';

interface MessageFormValues {
  message: string;
}

export const MessageForm = () => {
  const dispatch = useDispatch();
  const channelId = useSelector(selectJoinedChannelId);
  const isConnected = useSelector((state: RootState) => state.messages.isConnected);
  const { secrets } = useRoomKey(channelId ?? undefined);
  const disabled = !isConnected;

  const handleSubmit = async (values: MessageFormValues, formikHelpers: FormikHelpers<MessageFormValues>) => {
    const text = values.message.trim();
    if (text.length < 1 || !channelId || !secrets) {
      return;
    }

    let payload: string;
    try {
      payload = await encrypt(secrets.key, JSON.stringify({ nickname: getNickname(), text }));
    } catch {
      toast.error('Could not encrypt that message — nothing was sent.');
      return;
    }

    dispatch(messageSubmitted({ channelId, payload, senderId: getSenderId() }));
    formikHelpers.resetForm();
  };

  return (
    <Formik
      initialValues={{
        message: '',
      }}
      onSubmit={handleSubmit}
    >
      {() => {
        return (
          <Form className={styles.form}>
            <div className={styles.bar}>
              <AppButton
                type={'submit'}
                variant={'transparent'}
                rounded={true}
                disabled={disabled}
                aria-label={'Send message'}
                style={{
                  position: 'absolute',
                  right: '1.25rem',
                  top: '50%',
                  transform: 'translate(0, -50%)',
                }}
              >
                <AppIcon icon={SendIcon} className={styles.sendIcon} />
              </AppButton>

              <TextInput
                name={'message'}
                className={styles.messageInput}
                placeholder={disabled ? 'Connecting…' : 'Write something...'}
                maxLength={2000}
                disabled={disabled}
              />
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};
