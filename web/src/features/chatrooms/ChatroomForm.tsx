import {Form, Formik, FormikHelpers} from "formik";
import {array, object, string} from "yup";
import {InputLabel} from "../../shared/InputLabel.tsx";
import {TextInput} from "../../shared/TextInput.tsx";
import {AppButton} from "../../shared/AppButton.tsx";
import React from "react";
import {ListboxInput} from "../../shared/ListboxInput.tsx";
import {useSelector} from "react-redux";
import {selectLoggedUser} from "../auth/authSlice.ts";
import toast from "react-hot-toast";
import {getErrorMessage} from "../../shared/getErrorMessage.ts";
import {User} from "../../interfaces.ts";
import {useCreateChatroomMutation} from "../../services/chatroomsApi.ts";

interface ChatroomFormProps {
    closeModal: () => void;
}

interface ChatroomFormValues {
    name: string,
    users: User[]
}


export const ChatroomForm = (
    {
        closeModal,
    }: ChatroomFormProps
) => {
    const [createChatroom] = useCreateChatroomMutation();
    const loggedUser = useSelector(selectLoggedUser);

    const handleSubmit = async (values: ChatroomFormValues, formikHelpers: FormikHelpers<ChatroomFormValues>
    ) => {
        const {users, name} = values;
        const userIds = users.map(u => u.id)
        try {
            await createChatroom({
                users: userIds,
                name: name,
            }).unwrap()
            toast.success('Successfully created new chatroom!')
        } catch (error) {
            toast.error('Failed to create chatroom. ' + (getErrorMessage(error) || ''));
        }
        closeModal()
        formikHelpers.resetForm();
    }

    return (
        <Formik
            initialValues={{
                name: '',
                users: [loggedUser!],
            }}
            validationSchema={object({
                name: string()
                    .required()
                    .min(3).max(50),
                users: array().min(1)
            })}
            onSubmit={handleSubmit}
        >
            {() => (<div className={"flex flex-col gap-3 w-full mt-2"}>
                    <Form className={"w-full flex flex-col gap-3 min-w-80 bg-black/5 p-4 rounded"}>
                        <div>
                            <InputLabel htmlFor={"name"}>Channel name</InputLabel>
                            <TextInput name={"name"} type={"name"} placeholder={"Channel name"}/>
                        </div>
                        <div>
                            <InputLabel htmlFor={"users"}>Users</InputLabel><br/>
                            <ListboxInput name={'users'} disableSelf={false} />
                        </div>
                        <div className="flex gap-4 justify-end">
                            <AppButton onClick={() => closeModal()}>Cancel</AppButton>
                            <AppButton type={'submit'}>Add</AppButton>
                        </div>
                    </Form>
                </div>
            )}
        </Formik>
    )
}
