import {useNavigate} from "react-router";
import {Formik, FormikHelpers} from "formik";
import {object, string} from "yup";
import {InputLabel} from "../../shared/InputLabel.tsx";
import {TextInput} from "../../shared/TextInput.tsx";
import {AppButton} from "../../shared/AppButton.tsx";
import toast from "react-hot-toast";
import {useRegisterMutation} from "../../services/authApi.ts";
import {FormHeading} from "../../shared/FormHeading.tsx";
import {FormActions} from "../../shared/FormActions.tsx";
import {FormContainer} from "../../shared/FormContainer.tsx";

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
        className="rounded-lg min-w-80 flex flex-col justify-center align-middle gap-3 bg-slate-800/35 shadow-sm py-11 px-12">
        <FormHeading as="h1">Register</FormHeading>
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
            <FormContainer>
              <div>
                <InputLabel htmlFor={"email"}>Email</InputLabel>
                <TextInput name={"email"} type={"email"} placeholder={"youremail@domain.com"} />
              </div>
              <div>
                <InputLabel htmlFor={"name"}>Name</InputLabel>
                <TextInput name={"name"} type={"name"} />
              </div>
              <div>
                <InputLabel htmlFor={"email"}>Password</InputLabel>
                <TextInput name={"password"} type={"password"} />
              </div>
              <AppButton className={"mt-2"} variant={'slate'} loader={isLoading} type={'submit'}>
                Register
              </AppButton>
              <p className={"text-sm text-center mt-4 text-gray-300"}>Already have an account?</p>
              <FormActions className={"mt-0"}>
                <AppButton variant={'purple'} type={"button"} className={"w-full"} onClick={handleGoToLoginClick}>
                  Sign in
                </AppButton>
              </FormActions>
            </FormContainer>
          )}
        </Formik>
      </div>
    )
}
