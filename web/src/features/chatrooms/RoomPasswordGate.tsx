import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import React from 'react';
import { InputLabel } from '../../shared/InputLabel.tsx';
import { TextInput } from '../../shared/TextInput.tsx';
import { AppButton } from '../../shared/AppButton.tsx';
import { FormContainer } from '../../shared/FormContainer.tsx';
import { Chatroom } from '../../interfaces.ts';
import { base64ToUint8, deriveRoomKey, verifyKey } from '../../utils/roomCrypto.ts';

interface RoomPasswordGateProps {
  channelData?: Chatroom;
  onUnlock: (key: CryptoKey) => void;
}

interface RoomPasswordFormValues {
  password: string;
}

export const RoomPasswordGate = ({ channelData, onUnlock }: RoomPasswordGateProps) => {
  const handleSubmit = async (
    { password }: RoomPasswordFormValues,
    formikHelpers: FormikHelpers<RoomPasswordFormValues>,
  ) => {
    if (!channelData) return;

    const key = await deriveRoomKey(password, base64ToUint8(channelData.salt));
    const isCorrect = await verifyKey(key, channelData.verificationToken);

    if (!isCorrect) {
      formikHelpers.setFieldError('password', 'Incorrect password');
      return;
    }

    onUnlock(key);
  };

  return (
    <div className={'grow flex items-center justify-center p-4'}>
      <Formik
        initialValues={{ password: '' }}
        validationSchema={object({ password: string().required('Password is required') })}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <FormContainer className="min-w-80 max-w-96">
            <div className={'text-center'}>
              <h2 className={'text-xl mb-1'}>This room is encrypted</h2>
              <p className={'text-sm text-gray-400'}>
                Enter the room password to decrypt messages. It never leaves your browser.
              </p>
            </div>
            <div>
              <InputLabel htmlFor={'password'}>Room password</InputLabel>
              <TextInput name={'password'} type={'password'} placeholder={'Room password'} autoFocus />
            </div>
            <AppButton variant={'purple'} type={'submit'} disabled={isSubmitting}>
              {isSubmitting ? 'Unlocking…' : 'Unlock'}
            </AppButton>
          </FormContainer>
        )}
      </Formik>
    </div>
  );
};