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

const EXISTING_USER = {
  id: 1,
  name: 'Ava Johnson',
  email: 'ava.johnson@example.com',
  role: 'Product Manager',
  location: 'Austin, TX',
  status: 'Active',
}

function renderEditModal(overrides = {}) {
  const onClose = vi.fn()
  const onSaveUser = vi.fn()
  render(
    <AddUserModal
      isOpen={overrides.isOpen ?? true}
      onClose={overrides.onClose ?? onClose}
      onAddUser={vi.fn()}
      onSaveUser={overrides.onSaveUser ?? onSaveUser}
      initialUser={overrides.initialUser ?? EXISTING_USER}
    />,
  )
  return { onClose, onSaveUser }
}

// AC-2: Edit modal heading and pre-population
describe('AC-2: edit modal shows "Edit User" heading and pre-populated fields', () => {
  it('renders modal heading "Edit User" when initialUser is provided', () => {
    renderEditModal()
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Edit User')
  })

  it('pre-populates Name field with existing user name', () => {
    renderEditModal()
    expect(screen.getByLabelText(/^Name/i)).toHaveValue(EXISTING_USER.name)
  })

  it('pre-populates Email field with existing user email', () => {
    renderEditModal()
    expect(screen.getByLabelText(/^Email/i)).toHaveValue(EXISTING_USER.email)
  })

  it('pre-populates Role field with existing user role', () => {
    renderEditModal()
    expect(screen.getByLabelText(/^Role/i)).toHaveValue(EXISTING_USER.role)
  })

  it('pre-populates Location field with existing user location', () => {
    renderEditModal()
    expect(screen.getByLabelText(/^Location/i)).toHaveValue(EXISTING_USER.location)
  })

  it('pre-populates Status field with existing user status', () => {
    renderEditModal()
    expect(screen.getByLabelText(/^Status/i)).toHaveValue(EXISTING_USER.status)
  })

  it('renders primary button labeled "Save" in edit mode', () => {
    renderEditModal()
    expect(screen.getByRole('button', { name: /^Save$/i })).toBeInTheDocument()
  })
})

// AC-3: Edit modal validation — same rules as add mode
describe('AC-3: edit modal validation blocks invalid submissions', () => {
  it('shows Name required error when name is cleared on submit', () => {
    const { onSaveUser } = renderEditModal()
    fireEvent.change(screen.getByLabelText(/^Name/i), { target: { name: 'name', value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /^Save$/i }))
    expect(screen.getByText('Name is required.')).toBeInTheDocument()
    expect(onSaveUser).not.toHaveBeenCalled()
  })

  it('shows email format error for invalid email in edit mode', () => {
    const { onSaveUser } = renderEditModal()
    fireEvent.change(screen.getByLabelText(/^Email/i), { target: { name: 'email', value: 'notanemail' } })
    fireEvent.click(screen.getByRole('button', { name: /^Save$/i }))
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(onSaveUser).not.toHaveBeenCalled()
  })
})

// AC-4 (unit level): valid edit submit calls onSaveUser with updated fields preserving id
describe('AC-4 & AC-8: valid edit submit calls onSaveUser with updated payload including original id', () => {
  it('calls onSaveUser with updated name and original id', () => {
    const { onSaveUser } = renderEditModal()
    fireEvent.change(screen.getByLabelText(/^Name/i), { target: { name: 'name', value: 'Ava Smith' } })
    fireEvent.click(screen.getByRole('button', { name: /^Save$/i }))
    expect(onSaveUser).toHaveBeenCalledOnce()
    expect(onSaveUser).toHaveBeenCalledWith(
      expect.objectContaining({ id: EXISTING_USER.id, name: 'Ava Smith' }),
    )
  })

  it('calls onSaveUser with all five updated fields', () => {
    const { onSaveUser } = renderEditModal()
    fireEvent.change(screen.getByLabelText(/^Name/i), { target: { name: 'name', value: 'Ava Smith' } })
    fireEvent.change(screen.getByLabelText(/^Email/i), { target: { name: 'email', value: 'ava.smith@example.com' } })
    fireEvent.change(screen.getByLabelText(/^Role/i), { target: { name: 'role', value: 'Director' } })
    fireEvent.change(screen.getByLabelText(/^Location/i), { target: { name: 'location', value: 'Chicago, IL' } })
    fireEvent.change(screen.getByLabelText(/^Status/i), { target: { name: 'status', value: 'Inactive' } })
    fireEvent.click(screen.getByRole('button', { name: /^Save$/i }))
    expect(onSaveUser).toHaveBeenCalledWith({
      id: EXISTING_USER.id,
      name: 'Ava Smith',
      email: 'ava.smith@example.com',
      role: 'Director',
      location: 'Chicago, IL',
      status: 'Inactive',
    })
  })
})
