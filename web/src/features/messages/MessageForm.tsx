import { TextInput } from '../../shared/TextInput.tsx';
import { Form, Formik, FormikHelpers } from 'formik';
import React from 'react';
import { AppButton } from '../../shared/AppButton.tsx';
import { AppIcon } from '../../shared/AppIcon.tsx';
import SendIcon from '../../assets/icons/send.svg?react';
import styles from './MessageForm.module.scss';

interface MessageFormValues {
  message: string;
}

interface MessageFormProps {
  sendMessage: (message: string) => void;
  disabled?: boolean;
}

export const MessageForm = ({ sendMessage, disabled = false }: MessageFormProps) => {
  const handleSubmit = (values: MessageFormValues, formikHelpers: FormikHelpers<MessageFormValues>) => {
    if (values.message.trim().length < 1) {
      return;
    }

    sendMessage(values.message);
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
