import {Formik, FormikHelpers} from "formik";
import {array, object, string} from "yup";
import {InputLabel} from "../../shared/InputLabel.tsx";
import {TextInput} from "../../shared/TextInput.tsx";
import {AppButton} from "../../shared/AppButton.tsx";
import React from "react";
import {ListboxInput} from "../../shared/ListboxInput.tsx";
import {FormActions} from "../../shared/FormActions.tsx";
import {FormContainer} from "../../shared/FormContainer.tsx";
import {useSelector} from "react-redux";
import {selectLoggedUser} from "../auth/authSlice.ts";
import toast from "react-hot-toast";
import {getErrorMessage} from "../../shared/getErrorMessage.ts";
import {User} from "../../interfaces.ts";
import {useCreateChatroomMutation} from "../../services/chatroomsApi.ts";

interface CreateChatroomFormProps {
    closeModal: () => void;
}

interface CreateChatroomFormValues {
    name: string,
    users: User[]
}


export const CreateChatroomForm = (
    {
        closeModal,
    }: CreateChatroomFormProps
) => {
    const [createChatroom] = useCreateChatroomMutation();
    const loggedUser = useSelector(selectLoggedUser);

    const handleSubmit = async (values: CreateChatroomFormValues, formikHelpers: FormikHelpers<CreateChatroomFormValues>
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
            {() => (
                    <FormContainer className="min-w-80">
                        <div>
                            <InputLabel htmlFor={"name"}>Channel name</InputLabel>
                            <TextInput name={"name"} type={"name"} placeholder={"Channel name"}/>
                        </div>
                        <div>
                            <InputLabel htmlFor={"users"}>Users</InputLabel><br/>
                            <ListboxInput name={'users'} disableSelf={false} />
                        </div>
                        <FormActions equalWidth>
                            <AppButton onClick={() => closeModal()}>Cancel</AppButton>
                            <AppButton variant={"purple"} type={'submit'}>Add</AppButton>
                        </FormActions>
                    </FormContainer>
            )}
        </Formik>
    )
}