import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { TextInput } from '../../shared/TextInput.tsx';
import { InputLabel } from '../../shared/InputLabel.tsx';
import { AppButton } from '../../shared/AppButton.tsx';
import { object, string } from 'yup';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useLoginMutation } from '../../services/authApi.ts';

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
            className="rounded-lg min-w-80 flex flex-col justify-center align-middle frounded-lg gap-3 bg-fuchsia-900/10 shadow-sm p-12">
            <h1 className="font-medium text-2xl mb-5 text-left">Sign in</h1>
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
                        <Form className={"w-full flex flex-col gap-3 min-w-64"}>
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
                        </Form>
                        <p className={"text-sm text-center mt-4 text-gray-300"}>New to Chatrooms?</p>
                        <div className={"flex gap-4"}>
                            <AppButton type={"button"} className={"w-1/2 bg-slate-900/80"} onClick={handleRegisterButtonClick}>
                                Register
                            </AppButton>
                            <AppButton type={"button"} className={"w-1/2 whitespace-nowrap"}
                                       onClick={() => handleDemoButtonClick(formikConfig)}>
                                Demo account
                            </AppButton>
                        </div>
                    </>
                )}
            </Formik>
        </div>
    )
}
