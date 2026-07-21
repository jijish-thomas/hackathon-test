import { Modal } from '@carbon/react'

function DeleteConfirmModal({ user, onConfirm, onClose }) {
  return (
    <Modal
      open={!!user}
      modalHeading="Delete User"
      primaryButtonText="Delete"
      secondaryButtonText="Cancel"
      danger
      onRequestClose={onClose}
      onSecondarySubmit={onClose}
      onRequestSubmit={() => onConfirm(user.id)}
    >
      <p>
        Delete <strong>{user?.name}</strong>? This action cannot be undone.
      </p>
    </Modal>
  )
}

export default DeleteConfirmModal
