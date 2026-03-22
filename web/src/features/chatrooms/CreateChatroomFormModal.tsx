import { CreateChatroomForm } from './CreateChatroomForm.tsx';
import { AppModal } from '../../shared/AppModal.tsx';

interface CreateChatroomFormModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

export const CreateChatroomFormModal = (
  {
    isOpen,
    closeModal,
  }: CreateChatroomFormModalProps,
) => {
  return (
    <AppModal
      title={'Add chatroom'}
      isOpen={isOpen}
      onClose={closeModal}
    >
      <CreateChatroomForm closeModal={closeModal} />
    </AppModal>
  );
};