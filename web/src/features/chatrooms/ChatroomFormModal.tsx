import { ChatroomForm } from './ChatroomForm.tsx';
import { EditChatroomForm } from './EditChatroomForm.tsx';
import { AppModal } from '../../shared/AppModal.tsx';
import { Chatroom } from '../../interfaces.ts';

interface ChatroomFormModalProps {
  isOpen: boolean;
  closeModal: () => void;
  isEditing?: boolean;
  initialValues?: Chatroom
  onSuccess?: () => void;
}

export const ChatroomFormModal = (
  {
    onSuccess,
    isEditing = false,
    isOpen,
    closeModal,
    initialValues,
  }: ChatroomFormModalProps,
) => {
  return (
    <>
      <AppModal
        title={isEditing ? 'Edit chatroom' : 'Add chatroom'}
        isOpen={isOpen}
        onClose={closeModal}
      >
        {isEditing && initialValues ?
          <EditChatroomForm closeModal={() => closeModal()} onSuccess={onSuccess} initialValues={initialValues} /> :
          <ChatroomForm closeModal={() => closeModal()} />}
      </AppModal>
    </>
  );
};