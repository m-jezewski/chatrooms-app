import {Formik, FormikHelpers, FormikProps} from "formik";
import {TextInput} from "../../shared/TextInput.tsx";
import {InputLabel} from "../../shared/InputLabel.tsx";
import {AppButton} from "../../shared/AppButton.tsx";
import {object, string} from "yup";
import {useNavigate} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {selectAuthState} from "./authSlice.ts";
import toast from "react-hot-toast";
import {AppDispatch} from "../../store.ts";
import {loginAction} from "./authActions.ts";

interface formValues {
    email: string;
    password: string;
}

export const Login = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {user, error, isLoading} = useSelector(selectAuthState)

    const navigate = useNavigate();

    const handleSubmit = async (values: formValues, formikHelpers: FormikHelpers<formValues>) => {
        try {
            const res = await dispatch(loginAction(values))
            if(res.payload){
                navigate("/chatrooms")
            }
        } catch (error) {
            toast.error('Failed to log in.')
        }
        formikHelpers.resetForm();
    }

    const handleRegisterButtonClick = () => {
        navigate("/register");
    }

    const handleDemoButtonClick = async (formikConfig: FormikProps<formValues>) => {
        await formikConfig.setValues({
            email: 'public_user@chatrooms.com',
            password: "public_user_password",
        }, true)
    }

    return (
        <div
            className="rounded-lg min-w-80 flex flex-col justify-center align-middle frounded-lg bg-gradient-to-tr from-fuchsia-950 from-10% via-pink-900 to-rose-900 to-90% shadow-rose-700/50 shadow-sm p-5">
            <h1 className="font-medium text-xl text-center">Sign in</h1>
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
                {(formikConfig) => (<div className={"flex flex-col gap-3 w-full mt-2"}>
                        <form
                            className={"w-full flex flex-col gap-3"}
                            onSubmit={(e) => {
                                e.preventDefault();
                                formikConfig.submitForm();
                            }}
                        >
                            <div>
                                <InputLabel htmlFor={"email"}>Email</InputLabel>
                                <TextInput name={"email"} type={"email"} placeholder={"youremail@domain.com"}/>
                            </div>
                            <div>
                                <InputLabel htmlFor={"email"}>Password</InputLabel>
                                <TextInput name={"password"} type={"password"}/>
                            </div>
                            <AppButton loader={isLoading} className={"mt-2"}>
                                Sign in
                            </AppButton>
                        </form>
                        <p className={"text-sm text-center mt-4 text-gray-300"}>New to Chatrooms?</p>
                        <div className={"flex gap-4"}>
                            <AppButton type={"button"} className={"w-1/2"} onClick={handleRegisterButtonClick}>
                                Register
                            </AppButton>
                            <AppButton type={"button"} className={"w-1/2"}
                                       onClick={() => handleDemoButtonClick(formikConfig)}>
                                Demo account
                            </AppButton>
                        </div>
                    </div>
                )}
            </Formik>
        </div>
    )
}