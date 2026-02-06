import {Formik, FormikHelpers} from "formik";
import {array, number, object, string} from "yup";
import {InputLabel} from "../../shared/InputLabel.tsx";
import {TextInput} from "../../shared/TextInput.tsx";
import {AppButton} from "../../shared/AppButton.tsx";
import React from "react";
import {ListboxInput} from "../../shared/ListboxInput.tsx";
import {useDispatch, useSelector} from "react-redux";
import {selectLoggedUser} from "../auth/authSlice.ts";
import {AppDispatch} from "../../store.ts";
import {createChatroomAction, listChatroomsAction} from "./chatroomsActions.ts";
import toast from "react-hot-toast";
import {User} from "../../interfaces.ts";

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
    const dispatch = useDispatch<AppDispatch>();
    const loggedUser = useSelector(selectLoggedUser);

    const handleSubmit = async (values: ChatroomFormValues, formikHelpers: FormikHelpers<ChatroomFormValues>
    ) => {
        const {users, name} = values;
        const userIds = users.map(u => u.id)
        try {
            const res = await dispatch(createChatroomAction({
                users: userIds,
                name: name,
            }))
            toast.success('Successfully created new chatroom!')
            dispatch(listChatroomsAction());
        } catch (error) {
            if (error instanceof Error) {
                toast.error('Failed to create chatroom. \n ' + error.message);
            }
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
                            <ListboxInput name={'users'} disableSelf={false} />
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