import React, {useState} from "react";
import {AppButton} from "../../shared/AppButton.tsx";
import {Dialog, DialogPanel, DialogTitle} from "@headlessui/react";
import {EditUserForm} from "./EditUserForm.tsx";
import {CreateUserForm} from "./CreateUserForm.tsx";
import {User} from "../../interfaces.ts";

export const UserFormModal = ({initialValues, isEditing, isOpen, closeModal}: {
    initialValues: User,
    isEditing: boolean,
    isOpen: boolean,
    closeModal: () => void
}) => {

    const title = isEditing ? "Edit user" : "Add new user"

    return (
        <>
            <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/20">
                    <DialogPanel
                        className="max-w-lg space-y-4 px-8 py-8 bg-gradient-to-tr from-fuchsia-950 from-10% via-pink-900 to-rose-900 to-90% shadow-rose-700/50 shadow-lg rounded-lg backdrop-blur-2xl ">
                        <div className={"flex justify-between"}>
                            <DialogTitle className="text-2xl">{title}</DialogTitle>
                            <AppButton
                                variant={'transparent'}
                                rounded={true} onClick={closeModal}>
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     height="16px" viewBox="0 -960 960 960"
                                     width="16px" fill="#e8eaed">
                                    <path
                                        d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                                </svg>
                            </AppButton>
                        </div>
                        {isEditing ?
                            <EditUserForm
                                initialValues={initialValues}
                                closeModal={closeModal}
                            /> :
                            <CreateUserForm
                                closeModal={closeModal}
                            />}
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    )
}