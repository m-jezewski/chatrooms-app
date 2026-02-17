import {Field, FieldProps, Form, Formik, FormikHelpers} from "formik";
import {object, string} from "yup";
import {InputLabel} from "../../shared/InputLabel.tsx";
import {TextInput} from "../../shared/TextInput.tsx";
import {AppButton} from "../../shared/AppButton.tsx";
import React from "react";
import toast from "react-hot-toast";
import {User} from "../../interfaces.ts";
import {useUpdateUserMutation} from "../../services/usersApi.ts";

interface ChatroomFormProps {
    closeModal: () => void;
    initialValues: User
}

interface UserFormValues {
    name: string,
    email: string,
    role: 'ADMIN' | 'USER',
}

export const EditUserForm = (
    {
        closeModal,
        initialValues,
    }: ChatroomFormProps
) => {
    const [updateUser] = useUpdateUserMutation();

    const handleSubmit = async (values: UserFormValues, formikHelpers: FormikHelpers<UserFormValues>
    ) => {
        const {email, role, name} = values;
        try {
            await updateUser({
                id: initialValues.id,
                email,
                role,
                name,
            }).unwrap()
            toast.success('Successfully edited user!')
        } catch (error) {
            if (error instanceof Error) {
                toast.error('Failed to edit user. \n ' + error.message);
            }
        }
        formikHelpers.resetForm();
        closeModal()
    }

    return (
        <Formik
            enableReinitialize={true}
            initialValues={{
                name: initialValues.name,
                email: initialValues.email,
                role: initialValues.role || 'USER',
            }}
            validationSchema={object({
                email: string()
                    .email()
                    .required(),
                name: string()
                    .required()
                    .min(3)
                    .max(75),
                role: string().required(),

            })}
            onSubmit={handleSubmit}
        >
            {(formikConfig) => (<div className={"flex flex-col gap-3 w-full mt-2"}>
                    <Form className={"w-full flex flex-col gap-3 min-w-80 bg-black/20 p-4 rounded"}>
                        <div>
                            <InputLabel htmlFor={"email"}>Email</InputLabel>
                            <TextInput name={"email"} type={"email"} placeholder={"useremail@domain.com"}/>
                        </div>
                        <div>
                            <InputLabel htmlFor={"name"}>Name</InputLabel>
                            <TextInput name={"name"} type={"text"} placeholder={"Name"}/>
                        </div>
                        <div className="flex flex-col">
                            <InputLabel htmlFor={"role"}>Role</InputLabel>
                            <div className={"mt-1"}>
                                <Field name={'role'}>{({field}: FieldProps) => <input type={'radio'} {...field} value={'USER'} checked={field.value === 'USER'}/>}</Field> User
                            </div>
                            <div>
                                <Field name={'role'}>{({field}: FieldProps) => <input type={'radio'} {...field} value={'ADMIN'} checked={field.value === 'ADMIN'}/>}</Field> Admin
                            </div>
                        </div>
                        <div className="flex gap-4 justify-end">
                            <AppButton onClick={() => {
                                formikConfig.resetForm()
                                closeModal()
                            }}>Cancel</AppButton>
                            <AppButton type={'submit'} variant={'slate'}>Edit User</AppButton>
                        </div>
                    </Form>
                </div>
            )}
        </Formik>
    )
}
