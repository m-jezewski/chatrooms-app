import { Formik, FormikHelpers, FormikProps } from 'formik';
import { TextInput } from '../../shared/TextInput.tsx';
import { InputLabel } from '../../shared/InputLabel.tsx';
import { AppButton } from '../../shared/AppButton.tsx';
import { object, string } from 'yup';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useLoginMutation } from '../../services/authApi.ts';
import { FormHeading } from '../../shared/FormHeading.tsx';
import { FormActions } from '../../shared/FormActions.tsx';
import { FormContainer } from '../../shared/FormContainer.tsx';

interface formValues {
  email: string;
  password: string;
}

export const Login = () => {
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();

  const handleSubmit = async (values: formValues, formikHelpers: FormikHelpers<formValues>) => {
    try {
      await login(values).unwrap();
      navigate('/chatrooms');
    } catch (error) {
      toast.error('Failed to log in.');
    }
    formikHelpers.resetForm();
  };

  const handleRegisterButtonClick = () => {
    navigate('/register');
  };

  const handleDemoButtonClick = async (formikConfig: FormikProps<formValues>) => {
    await formikConfig.setValues({
      email: 'public_user@chatrooms.com',
      password: 'public_user_password',
    }, true);
  };

    return (
        <div
            className="rounded-lg min-w-80 flex flex-col justify-center align-middle gap-3 bg-fuchsia-900/15 shadow-sm py-11 px-12">
            <FormHeading as="h1">Sign in</FormHeading>
            <Formik
                initialValues={{
                    email: '',
                    password: '',
                }}
                validationSchema={object({
                    email: string()
                        .email()
                        .required(),
                    password: string().required().min(5).max(50)
                })}
                onSubmit={handleSubmit}
            >
                {(formikConfig) => (<>
                        <FormContainer>
                            <div>
                                <InputLabel htmlFor={"email"}>Email</InputLabel>
                                <TextInput name={"email"} type={"email"} placeholder={"youremail@domain.com"}/>
                            </div>
                            <div>
                                <InputLabel htmlFor={"password"}>Password</InputLabel>
                                <TextInput name={"password"} type={"password"} placeholder={"********"}/>
                            </div>
                            <AppButton variant={'purple'} loader={isLoading} className={"mt-3"}>
                                Sign in
                            </AppButton>
                        </FormContainer>
                        <p className={"text-sm text-center mt-4 text-gray-300"}>New to Chatrooms?</p>
                        <FormActions className={"mt-0"}>
                            <AppButton type={"button"} variant={'slate'} className={"w-1/2"} onClick={handleRegisterButtonClick}>
                                Register
                            </AppButton>
                            <AppButton type={"button"} className={"w-1/2 whitespace-nowrap"}
                                       onClick={() => handleDemoButtonClick(formikConfig)}>
                                Demo account
                            </AppButton>
                        </FormActions>
                    </>
                )}
            </Formik>
        </div>
    )
}
