import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import toast from 'react-hot-toast';
import { InputLabel } from '../../shared/InputLabel.tsx';
import { TextInput } from '../../shared/TextInput.tsx';
import { AppButton } from '../../shared/AppButton.tsx';
import { FormActions } from '../../shared/FormActions.tsx';
import { FormContainer } from '../../shared/FormContainer.tsx';
import { useRegisterMutation } from '../../services/authApi.ts';
import { ERROR_MESSAGES, failureMessage } from '../../shared/requestError.ts';
import styles from './RegisterForm.module.scss';

interface RegisterFormValues {
  email: string;
  name: string;
  password: string;
}

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm = ({ onSuccess, onSwitchToLogin }: RegisterFormProps) => {
  const [register, { isLoading }] = useRegisterMutation();

  const handleSubmit = async (values: RegisterFormValues, formikHelpers: FormikHelpers<RegisterFormValues>) => {
    try {
      await register(values).unwrap();
      formikHelpers.resetForm();
      toast.success('Successfully registered!');
      onSuccess?.();
    } catch (error) {
      toast.error(
        failureMessage(error, 'Failed to register.', {
          409: 'That email is already registered',
          429: ERROR_MESSAGES.RETRY_LATER,
        }),
      );
    }
  };

  return (
    <Formik
      initialValues={{
        email: '',
        name: '',
        password: '',
      }}
      validationSchema={object({
        email: string().email().required(),
        password: string().required().min(5).max(50),
        name: string().required().min(3).max(75),
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
              <InputLabel htmlFor={'name'}>Name</InputLabel>
              <TextInput name={'name'} type={'text'} autoComplete={'nickname'} />
            </div>
            <div>
              <InputLabel htmlFor={'password'}>Password</InputLabel>
              <TextInput name={'password'} type={'password'} autoComplete={'new-password'} placeholder={'********'} />
            </div>
            <AppButton variant={'accent'} loader={isLoading} type={'submit'} className={styles.register}>
              Register
            </AppButton>
          </FormContainer>
          <p className={styles.subtext}>Already have an account?</p>
          <FormActions className={styles.switchAction}>
            <AppButton type={'button'} variant={'slate'} className={styles.half} onClick={onSwitchToLogin}>
              Sign in
            </AppButton>
          </FormActions>
        </>
      )}
    </Formik>
  );
};
