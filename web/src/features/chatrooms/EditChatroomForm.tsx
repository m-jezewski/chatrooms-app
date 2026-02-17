import {Formik, FormikHelpers} from "formik";
import {array, object, string} from "yup";
import {InputLabel} from "../../shared/InputLabel.tsx";
import {TextInput} from "../../shared/TextInput.tsx";
import {ListboxInput} from "../../shared/ListboxInput.tsx";
import {AppButton} from "../../shared/AppButton.tsx";
import React from "react";
import {User} from "../../interfaces.ts";
import toast from "react-hot-toast";
import {useUpdateChatroomMutation} from "../../services/chatroomsApi.ts";
import {useGetUsersQuery} from "../../services/usersApi.ts";

interface EditChatroomFormProps {
    initialValues: {
        name: string,
        id: number,
        users: { id: number }[],
    };
    closeModal: () => void;
    onSuccess?: () => void;
}

interface EditChatroomFormState {
    users: User[],
    name: string,
}

export const EditChatroomForm = ({initialValues, closeModal, onSuccess}: EditChatroomFormProps) => {
    const [updateChatroom] = useUpdateChatroomMutation();
    const {data: users = []} = useGetUsersQuery();

    const initialUsers = users.filter(u => initialValues.users.some(user => user.id === u.id))

    const handleSubmit = async (values: EditChatroomFormState, formikHelpers: FormikHelpers<EditChatroomFormState>) => {
        const {users, name} = values;
        const userIds = users.map(u => u.id)
        try {
            await updateChatroom({
                name,
                users: userIds,
                id: initialValues.id
            }).unwrap()
            toast.success('Successfully edited chatroom!')
            onSuccess && onSuccess()
        } catch (error) {
            if (error instanceof Error) {
                toast.error('Failed to edit chatroom. \n ' + error.message);
            }
        }
        formikHelpers.resetForm();
    }

    return (
        <Formik
            enableReinitialize={true}
            initialValues={{
                name: initialValues.name,
                users: initialUsers,
            }}
            validationSchema={object({
                name: string()
                    .required()
                    .min(3).max(50),
                users: array().min(1)
            })}
            onSubmit={handleSubmit}
        >
            {(formikConfig) => (<div className={"flex flex-col gap-3 w-full mt-2"}>
                    <form
                        className={"w-full flex flex-col gap-3 min-w-80 bg-black/5 p-4 rounded"}
                        onSubmit={(e) => {
                            e.preventDefault();
                            formikConfig.submitForm();
                        }}
                    >
                        <div>
                            <InputLabel htmlFor={"name"}>Channel name</InputLabel>
                            <TextInput name={"name"} type={"name"} placeholder={"Channel name"}/>
                        </div>
                        <div>
                            <InputLabel htmlFor={"users"}>Users</InputLabel><br/>
                            <ListboxInput name={'users'} disableSelf={false}/>
                        </div>
                        <div className="flex gap-4 justify-end">
                            <AppButton onClick={() => closeModal()}>Cancel</AppButton>
                            <AppButton type={'submit'}>Edit</AppButton>
                        </div>
                    </form>
                </div>
            )}
        </Formik>
    )
}
