import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import toast from 'react-hot-toast';
import { TextInput } from '../../shared/TextInput.tsx';
import { InputLabel } from '../../shared/InputLabel.tsx';
import { AppButton } from '../../shared/AppButton.tsx';
import { FormActions } from '../../shared/FormActions.tsx';
import { FormContainer } from '../../shared/FormContainer.tsx';
import { useLoginMutation } from '../../services/authApi.ts';
import { ERROR_MESSAGES, failureMessage } from '../../shared/requestError.ts';
import styles from './LoginForm.module.scss';

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm = ({ onSuccess, onSwitchToRegister }: LoginFormProps) => {
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (values: LoginFormValues, formikHelpers: FormikHelpers<LoginFormValues>) => {
    try {
      await login(values).unwrap();
      formikHelpers.resetForm();
      onSuccess?.();
    } catch (error) {
      toast.error(
        failureMessage(error, 'Failed to log in.', {
          401: 'Wrong email or password',
          429: ERROR_MESSAGES.RETRY_IN_A_MINUTE,
        }),
      );
    }
  };

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
      }}
      validationSchema={object({
        email: string().email().required(),
        password: string().required().min(5).max(50),
      })}
      onSubmit={handleSubmit}
    >
      {() => (
        <>
          <FormContainer>
            <div>
              <InputLabel htmlFor={'email'}>Email</InputLabel>
              <TextInput name={'email'} type={'email'} autoComplete={'email'} placeholder={'youremail@domain.com'} />
            </div>
            <div>
              <InputLabel htmlFor={'password'}>Password</InputLabel>
              <TextInput
                name={'password'}
                type={'password'}
                autoComplete={'current-password'}
                placeholder={'********'}
              />
            </div>
            <AppButton variant={'accent'} type={'submit'} loader={isLoading} className={styles.signIn}>
              Sign in
            </AppButton>
          </FormContainer>
          <p className={styles.subtext}>New to Chatrooms?</p>
          <FormActions className={styles.switchAction}>
            <AppButton type={'button'} variant={'slate'} className={styles.half} onClick={onSwitchToRegister}>
              Register
            </AppButton>
          </FormActions>
        </>
      )}
    </Formik>
  );
};
