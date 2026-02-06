import {Dialog, DialogPanel, DialogTitle} from "@headlessui/react";
import {AppButton} from "../../shared/AppButton.tsx";
import {ChatroomForm} from "./ChatroomForm.tsx";
import {EditChatroomForm} from "./EditChatroomForm.tsx";

interface ChatroomFormModalProps {
    isOpen: boolean;
    closeModal: () => void;
    isEditing?: boolean;
    initialValues?: {
        name: string,
        id: number,
        users: { id: number }[]
    } | null;
    onSuccess?: () => void;
}

export const ChatroomFormModal = ({ onSuccess, isEditing = false, isOpen, closeModal, initialValues}: ChatroomFormModalProps ) => {
    //todo refactor

    return (
        <>
            <Dialog open={isOpen} onClose={() => closeModal()} className="relative z-50">
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/10 backdrop-blur-sm">
                    <DialogPanel
                        className="max-w-lg space-y-4 px-8 py-8 bg-gradient-to-tr from-fuchsia-400/15 from-10% via-pink-400/10 to-rose-400/5 to-90% shadow-rose-300/15 shadow-sm rounded-lg backdrop-blur-2xl ">
                        <div className={"flex justify-between"}>
                            <DialogTitle className="text-2xl">{isEditing ? "Edit chatroom" : "Add chatroom"}</DialogTitle>
                            <AppButton
                                className={'-ml-4 -mt-4'}
                                variant={'transparent'}
                                rounded={true} onClick={() => closeModal()}>
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     height="20px" viewBox="0 -960 960 960"
                                     width="20px" fill="#e8eaed">
                                    <path
                                        d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                                </svg>
                            </AppButton>
                        </div>
                        {isEditing ? <EditChatroomForm closeModal={() => closeModal()} onSuccess={onSuccess} initialValues={initialValues || null} /> : <ChatroomForm closeModal={() => closeModal()}/>}
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    )
}