import {Field, FieldProps, Formik, FormikHelpers} from "formik";
import {array, number, object, string} from "yup";
import {InputLabel} from "../../shared/InputLabel.tsx";
import {TextInput} from "../../shared/TextInput.tsx";
import {AppButton} from "../../shared/AppButton.tsx";
import React from "react";
import {ListboxInput} from "../../shared/ListboxInput.tsx";
import {useDispatch, useSelector} from "react-redux";
import {selectLoggedUser} from "../auth/authSlice.ts";
import {AppDispatch} from "../../store.ts";
import toast from "react-hot-toast";
import {createUserAction, listUsersAction, updateUserDataAction} from "./usersActions.ts";

interface ChatroomFormProps {
    closeModal: () => void;
}

interface UserFormValues {
    name: string,
    password: string,
    email: string,
    role: 'ADMIN' | 'USER',
}


export const CreateUserForm = (
    {
        closeModal,
    }: ChatroomFormProps
) => {
    const dispatch = useDispatch<AppDispatch>();
    const loggedUser = useSelector(selectLoggedUser);

    const handleSubmit = async (values: UserFormValues, formikHelpers: FormikHelpers<UserFormValues>
    ) => {
        const {email, role, password, name} = values;
        try {
            const res = await dispatch(createUserAction({
                email,
                role,
                password,
                name,
            }))
            toast.success('Successfully created new user!')
            dispatch(listUsersAction());
        } catch (error) {
            if (error instanceof Error) {
                toast.error('Failed to create user. \n ' + error.message);
            }
        }
        formikHelpers.resetForm();
    }

    return (
        <Formik
            initialValues={{
                name: '',
                password: '',
                email: '',
                role: 'USER',
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
                role: string().required(),
            })}
            onSubmit={handleSubmit}
        >
            {(formikConfig) => (<div className={"flex flex-col gap-3 w-full mt-2"}>
                    <form
                        className={"w-full flex flex-col gap-3 min-w-80 bg-black/20 p-4 rounded"}
                        onSubmit={(e) => {
                            e.preventDefault();
                            formikConfig.submitForm();
                        }}
                    >
                        <div>
                            <InputLabel htmlFor={"email"}>Email</InputLabel>
                            <TextInput name={"email"} type={"email"} placeholder={"useremail@domain.com"}/>
                        </div>
                        <div>
                            <InputLabel htmlFor={"name"}>Name</InputLabel>
                            <TextInput name={"name"} type={"text"} placeholder={"Name"}/>
                        </div>
                        <div>
                            <InputLabel htmlFor={"password"}>Password</InputLabel>
                            <TextInput name={"password"} type={"password"} placeholder={"password"}/>
                        </div>
                        <div className="flex flex-col">
                            <InputLabel htmlFor={"role"}>Role</InputLabel>
                            <div className={"mt-1"}>
                                <Field name={'role'}>{({field}: FieldProps) => <input type={'radio'} {...field} value={'USER'}/>}</Field> User
                            </div>
                            <div>
                                <Field name={'role'}>{({field}: FieldProps) => <input type={'radio'} {...field} value={'ADMIN'}/>}</Field> Admin
                            </div>
                        </div>
                        <div className="flex gap-4 justify-end">
                            <AppButton onClick={() => closeModal()}>Cancel</AppButton>
                            <AppButton type={'submit'}>Add</AppButton>
                        </div>
                    </form>
                </div>
            )}
        </Formik>
    )
}