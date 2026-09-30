import React from 'react';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { object, string } from 'yup';
import toast from 'react-hot-toast';
import { TextInput } from '../../shared/TextInput.tsx';
import { InputLabel } from '../../shared/InputLabel.tsx';
import { AppButton } from '../../shared/AppButton.tsx';
import { FormActions } from '../../shared/FormActions.tsx';
import { FormContainer } from '../../shared/FormContainer.tsx';
import { useLoginMutation } from '../../services/authApi.ts';
import styles from './LoginForm.module.scss';

interface formValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm = ({ onSuccess, onSwitchToRegister }: LoginFormProps) => {
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (values: formValues, formikHelpers: FormikHelpers<formValues>) => {
    try {
      await login(values).unwrap();
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to log in.');
    }
    formikHelpers.resetForm();
  };

  const handleDemoButtonClick = async (formikConfig: FormikProps<formValues>) => {
    await formikConfig.setValues({
      email: 'public_user@chatrooms.com',
      password: 'public_user_password',
    }, true);
  };

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
      }}
      validationSchema={object({
        email: string()
          .email()
          .required(),
        password: string().required().min(5).max(50),
      })}
      onSubmit={handleSubmit}
    >
      {(formikConfig) => (
        <>
          <FormContainer>
            <div>
              <InputLabel htmlFor={'email'}>Email</InputLabel>
              <TextInput name={'email'} type={'email'} placeholder={'youremail@domain.com'} />
            </div>
            <div>
              <InputLabel htmlFor={'password'}>Password</InputLabel>
              <TextInput name={'password'} type={'password'} placeholder={'********'} />
            </div>
            <AppButton variant={'purple'} loader={isLoading} className={styles.signIn}>
              Sign in
            </AppButton>
          </FormContainer>
          <p className={styles.subtext}>New to Chatrooms?</p>
          <FormActions className={styles.noMargin}>
            <AppButton type={'button'} variant={'slate'} className={styles.half} onClick={onSwitchToRegister}>
              Register
            </AppButton>
            <AppButton type={'button'} className={styles.halfNowrap}
                       onClick={() => handleDemoButtonClick(formikConfig)}>
              Demo account
            </AppButton>
          </FormActions>
        </>
      )}
    </Formik>
  );
};
