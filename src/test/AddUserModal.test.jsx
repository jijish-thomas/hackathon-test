import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AddUserModal from '../AddUserModal'

const VALID_USER = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  role: 'Designer',
  location: 'Chicago, IL',
  status: 'Active',
}

function renderModal(props = {}) {
  const onClose = vi.fn()
  const onAddUser = vi.fn()
  render(
    <AddUserModal
      isOpen={props.isOpen ?? true}
      onClose={props.onClose ?? onClose}
      onAddUser={props.onAddUser ?? onAddUser}
    />,
  )
  return { onClose, onAddUser }
}

function fillForm(user) {
  fireEvent.change(screen.getByLabelText(/^Name/i), { target: { name: 'name', value: user.name } })
  fireEvent.change(screen.getByLabelText(/^Email/i), { target: { name: 'email', value: user.email } })
  fireEvent.change(screen.getByLabelText(/^Role/i), { target: { name: 'role', value: user.role } })
  fireEvent.change(screen.getByLabelText(/^Location/i), { target: { name: 'location', value: user.location } })
  fireEvent.change(screen.getByLabelText(/^Status/i), { target: { name: 'status', value: user.status } })
}

// AC-2: modal renders with 5 fields when open
describe('AC-2: modal opens with all five form fields', () => {
  it('renders Name, Email, Role, Location, Status fields', () => {
    renderModal()
    expect(screen.getByLabelText(/^Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Role/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Location/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Status/i)).toBeInTheDocument()
  })

  it('renders Status dropdown with Active, Pending, Inactive options', () => {
    renderModal()
    expect(screen.getByRole('option', { name: 'Active' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Pending' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Inactive' })).toBeInTheDocument()
  })
})

// AC-3: required-field validation — empty fields block submission
describe('AC-3: empty fields show inline errors and block submission', () => {
  it('shows error for each empty field on submit', () => {
    const { onAddUser } = renderModal()
    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }))
    expect(screen.getByText('Name is required.')).toBeInTheDocument()
    expect(screen.getByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Role is required.')).toBeInTheDocument()
    expect(screen.getByText('Location is required.')).toBeInTheDocument()
    expect(screen.getByText('Status is required.')).toBeInTheDocument()
    expect(onAddUser).not.toHaveBeenCalled()
  })

  it('shows error only for the empty field when others are filled', () => {
    const { onAddUser } = renderModal()
    fillForm({ ...VALID_USER, name: '' })
    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }))
    expect(screen.getByText('Name is required.')).toBeInTheDocument()
    expect(onAddUser).not.toHaveBeenCalled()
  })
})

// AC-4: email format validation
describe('AC-4: invalid email shows inline error and blocks submission', () => {
  it('shows error for missing @ in email', () => {
    const { onAddUser } = renderModal()
    fillForm({ ...VALID_USER, email: 'notanemail' })
    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }))
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(onAddUser).not.toHaveBeenCalled()
  })

  it('shows error for email missing domain', () => {
    const { onAddUser } = renderModal()
    fillForm({ ...VALID_USER, email: 'user@' })
    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }))
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(onAddUser).not.toHaveBeenCalled()
  })
})

// AC-5 & AC-6: valid submission calls onAddUser with correct data and resets form
describe('AC-5 & AC-6: valid submission calls onAddUser and resets form', () => {
  it('calls onAddUser with all five field values on valid submit', () => {
    const { onAddUser } = renderModal()
    fillForm(VALID_USER)
    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }))
    expect(onAddUser).toHaveBeenCalledOnce()
    expect(onAddUser).toHaveBeenCalledWith({
      name: VALID_USER.name,
      email: VALID_USER.email,
      role: VALID_USER.role,
      location: VALID_USER.location,
      status: VALID_USER.status,
    })
  })

  it('resets form fields to empty after successful submit', () => {
    renderModal()
    fillForm(VALID_USER)
    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }))
    expect(screen.getByLabelText(/^Name/i)).toHaveValue('')
    expect(screen.getByLabelText(/^Email/i)).toHaveValue('')
    expect(screen.getByLabelText(/^Role/i)).toHaveValue('')
    expect(screen.getByLabelText(/^Location/i)).toHaveValue('')
  })
})

// AC-7: cancel / dismiss closes without adding user and resets form
describe('AC-7: cancel closes modal without adding user and resets form', () => {
  it('calls onClose when Cancel is clicked', () => {
    const { onClose, onAddUser } = renderModal()
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(onClose).toHaveBeenCalledOnce()
    expect(onAddUser).not.toHaveBeenCalled()
  })

  it('resets form fields when Cancel is clicked', () => {
    renderModal()
    fillForm(VALID_USER)
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(screen.getByLabelText(/^Name/i)).toHaveValue('')
  })
})
