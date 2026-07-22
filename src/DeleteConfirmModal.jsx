import { Modal } from '@carbon/react'

function DeleteConfirmModal({ isOpen, userName, onClose, onConfirmDelete }) {
  return (
    <Modal
      open={isOpen}
      danger
      modalHeading={`Delete ${userName}?`}
      primaryButtonText="Delete"
      secondaryButtonText="Cancel"
      onRequestClose={onClose}
      onSecondarySubmit={onClose}
      onRequestSubmit={onConfirmDelete}
    />
  )
}

export default DeleteConfirmModal
