import {TextInput} from "../../shared/TextInput.tsx";
import {Formik, FormikHelpers} from "formik";
import React from "react";
import {AppButton} from "../../shared/AppButton.tsx";

interface MessageFormValues {
    message: string;
}

interface MessageFormProps {
    sendMessage: (message: string) => void;
}

export const MessageForm = ({sendMessage}: MessageFormProps) => {
    const handleSubmit = (values: MessageFormValues, formikHelpers: FormikHelpers<MessageFormValues>) => {
        sendMessage(values.message)
        formikHelpers.resetForm()
    }

    return (
        <Formik
            initialValues={{
                message: "",
            }}
            onSubmit={handleSubmit}
        >
            {formikConfig => {
                return (
                    <form className={"mt-auto"} onSubmit={(e) => {
                        e.preventDefault();
                        formikConfig.submitForm();
                    }}>
                        <div className={"border-t-2 border-slate-900 bg-gray-800 p-4 relative"}>
                            <AppButton variant={'transparent'} rounded={true} style={{
                                position: 'absolute',
                                right: '1.25rem',
                                top: '50%',
                                transform: 'translate(0, -50%)'
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960"
                                     width="20px"
                                     fill="#e8eaed">
                                    <path
                                        d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
                                </svg>
                            </AppButton>

                            <TextInput name={'message'} className={'p-3 pr-12 rounded-lg'}
                                       placeholder={"Write something..."}/>

                        </div>
                    </form>
                )
            }}
        </Formik>
    )
}