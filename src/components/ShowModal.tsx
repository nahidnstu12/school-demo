import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';

type ModalBodyProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  header?: string;
  message?: string;
  onPress: () => void;
};

export default function ShowModal({
  isOpen,
  onOpenChange,
  header = 'Delete Resource',
  message = 'Are you sure you want to delete the resource?',
  onPress,
}: ModalBodyProps) {
  return (
    <Modal backdrop="opaque" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{header}</ModalHeader>
            <ModalBody>
              <p>{message}</p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={onPress}>
                yes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
