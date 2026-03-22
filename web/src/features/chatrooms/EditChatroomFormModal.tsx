import { EditChatroomForm } from './EditChatroomForm.tsx';
import { AppModal } from '../../shared/AppModal.tsx';
import { Chatroom } from '../../interfaces.ts';

interface EditChatroomFormModalProps {
  isOpen: boolean;
  closeModal: () => void;
  initialValues: Chatroom;
  onSuccess?: () => void;
}

export const EditChatroomFormModal = (
  {
    isOpen,
    closeModal,
    initialValues,
    onSuccess,
  }: EditChatroomFormModalProps,
) => {
  return (
    <AppModal
      title={'Edit chatroom'}
      isOpen={isOpen}
      onClose={closeModal}
    >
      <EditChatroomForm closeModal={closeModal} onSuccess={onSuccess} initialValues={initialValues} />
    </AppModal>
  );
};