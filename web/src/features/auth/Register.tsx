import {useNavigate} from "react-router";
import {Form, Formik, FormikHelpers} from "formik";
import {object, string} from "yup";
import {InputLabel} from "../../shared/InputLabel.tsx";
import {TextInput} from "../../shared/TextInput.tsx";
import {AppButton} from "../../shared/AppButton.tsx";
import toast from "react-hot-toast";
import {useRegisterMutation} from "../../services/authApi.ts";

interface formValues {
    email: string;
    name: string;
    password: string;
}


export const Register = () => {
    const [register, {isLoading}] = useRegisterMutation();
    const navigate = useNavigate();

    const handleSubmit = async (values: formValues, formikHelpers: FormikHelpers<formValues>) => {
        try {
            await register(values).unwrap();
            navigate("/chatrooms")
            toast.success('Successfully registered!')
        } catch (error) {
            toast.error('Failed to register.')
        }
        formikHelpers.resetForm();
    }


    const handleGoToLoginClick = () => {
        navigate("/");
    }

    return (
        <div
            className="rounded-lg min-w-80 flex flex-col justify-center align-middle frounded-lg bg-gradient-to-bl from-fuchsia-950 from-10% via-pink-950 to-rose-900 to-90% p-5 shadow-rose-700/50 shadow-sm">
            <h1 className="font-medium text-xl text-center">Register</h1>
            <Formik
                initialValues={{
                    email: '',
                    name: '',
                    password: '',
                }}
                validationSchema={object({
                    email: string()
                        .email()
                        .required(),
                    password: string()
                        .required()
                        .min(5)
                        .max(50),
                    name: string()
                        .required()
                        .min(3)
                        .max(75),
                })}
                onSubmit={handleSubmit}
            >
                {() => (
                    <Form className={"flex flex-col gap-3 w-full mt-2"}>
                        <div>
                            <InputLabel htmlFor={"email"}>Email</InputLabel>
                            <TextInput name={"email"} type={"email"} placeholder={"youremail@domain.com"}/>
                        </div>
                        <div>
                            <InputLabel htmlFor={"name"}>Name</InputLabel>
                            <TextInput name={"name"} type={"name"}/>
                        </div>
                        <div>
                            <InputLabel htmlFor={"email"}>Password</InputLabel>
                            <TextInput name={"password"} type={"password"}/>
                        </div>
                        <AppButton className={"mt-2"} loader={isLoading} type={'submit'}>
                            Sign up
                        </AppButton>
                        <p className={"text-sm text-center mt-4 text-gray-300"}>Already have an account?</p>
                        <div className={"flex gap-4"}>
                            <AppButton type={"button"} className={"w-1/2"} onClick={handleGoToLoginClick}>
                                Login
                            </AppButton>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    )
}
