import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DeleteConfirmModal from '../DeleteConfirmModal'

function renderModal(props = {}) {
  const onClose = vi.fn()
  const onConfirmDelete = vi.fn()
  render(
    <DeleteConfirmModal
      isOpen={props.isOpen ?? true}
      userName={props.userName ?? 'Ava Johnson'}
      onClose={props.onClose ?? onClose}
      onConfirmDelete={props.onConfirmDelete ?? onConfirmDelete}
    />,
  )
  return { onClose, onConfirmDelete }
}

// AC-5: Delete button opens modal naming the user with Delete + Cancel buttons
describe('AC-5: modal renders with user name, Delete and Cancel buttons', () => {
  it('shows heading "Delete {userName}?"', () => {
    renderModal({ userName: 'Ava Johnson' })
    expect(screen.getByRole('heading', { name: /Delete Ava Johnson\?/i })).toBeInTheDocument()
  })

  it('renders a "Delete" primary button', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /^Delete$/i })).toBeInTheDocument()
  })

  it('renders a "Cancel" secondary button', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
  })
})

// AC-6: Cancel closes modal without calling onConfirmDelete
describe('AC-6: Cancel closes modal without confirming delete', () => {
  it('calls onClose when Cancel is clicked', () => {
    const { onClose, onConfirmDelete } = renderModal()
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(onClose).toHaveBeenCalledOnce()
    expect(onConfirmDelete).not.toHaveBeenCalled()
  })
})

// AC-7: Delete button calls onConfirmDelete
describe('AC-7: Delete button calls onConfirmDelete', () => {
  it('calls onConfirmDelete when Delete is clicked', () => {
    const { onConfirmDelete, onClose } = renderModal()
    fireEvent.click(screen.getByRole('button', { name: /^Delete$/i }))
    expect(onConfirmDelete).toHaveBeenCalledOnce()
    expect(onClose).not.toHaveBeenCalled()
  })
})

// AC-5 (edge): modal does not render when isOpen is false
describe('AC-5 edge: modal is not visible when isOpen is false', () => {
  it('does not show the dialog when isOpen=false', () => {
    renderModal({ isOpen: false })
    const dialog = screen.queryByRole('dialog')
    // Carbon keeps the node in DOM but removes is-visible when closed
    if (dialog) {
      const wrapper = dialog.closest('.cds--modal')
      expect(wrapper).not.toHaveClass('is-visible')
    } else {
      expect(dialog).toBeNull()
    }
  })
})
