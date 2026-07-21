import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

// Helpers
// Carbon icon-only buttons get accessible name from aria-labelledby (tooltip), not aria-label.
// Query by aria-label attribute directly.
function clickEditFor(name) {
  fireEvent.click(document.querySelector(`[aria-label="Edit ${name}"]`))
}

function clickDeleteFor(name) {
  fireEvent.click(document.querySelector(`[aria-label="Delete ${name}"]`))
}

// Scope form field changes to a specific dialog to avoid ID ambiguity.
// Both Add and Edit forms use the same field IDs — query by [name] attribute within the dialog DOM node.
function fillEditForm(dialog, { name, email, role, location, status } = {}) {
  if (name !== undefined)
    fireEvent.change(dialog.querySelector('input[name="name"]'), { target: { name: 'name', value: name } })
  if (email !== undefined)
    fireEvent.change(dialog.querySelector('input[name="email"]'), { target: { name: 'email', value: email } })
  if (role !== undefined)
    fireEvent.change(dialog.querySelector('input[name="role"]'), { target: { name: 'role', value: role } })
  if (location !== undefined)
    fireEvent.change(dialog.querySelector('input[name="location"]'), { target: { name: 'location', value: location } })
  if (status !== undefined)
    fireEvent.change(dialog.querySelector('select[name="status"]'), { target: { name: 'status', value: status } })
}

// AC-1: Actions column with Edit and Delete buttons on every row
describe('AC-1: Actions column with Edit and Delete buttons on every row', () => {
  it('renders an Actions column header', () => {
    render(<App />)
    expect(screen.getByRole('columnheader', { name: /Actions/i })).toBeInTheDocument()
  })

  it('renders Edit and Delete buttons for each seeded user', () => {
    const { container } = render(<App />)
    const seedNames = ['Ava Johnson', 'Noah Patel', 'Mia Chen', 'Liam Garcia', 'Sophia Nguyen']
    for (const name of seedNames) {
      expect(container.querySelector(`[aria-label="Edit ${name}"]`)).toBeInTheDocument()
      expect(container.querySelector(`[aria-label="Delete ${name}"]`)).toBeInTheDocument()
    }
  })
})

// AC-2: Edit button opens modal with heading "Edit User" and pre-filled fields
describe('AC-2: Edit button opens modal with "Edit User" heading and pre-filled fields', () => {
  it('opens a dialog labelled "Edit User" when Edit is clicked', () => {
    render(<App />)
    clickEditFor('Ava Johnson')
    expect(screen.getByRole('dialog', { name: /Edit User/i })).toBeInTheDocument()
  })

  it('pre-fills all five fields with the selected user values', () => {
    render(<App />)
    clickEditFor('Ava Johnson')
    const editDialog = screen.getByRole('dialog', { name: /Edit User/i })
    expect(editDialog.querySelector('input[name="name"]')).toHaveValue('Ava Johnson')
    expect(editDialog.querySelector('input[name="email"]')).toHaveValue('ava.johnson@example.com')
    expect(editDialog.querySelector('input[name="role"]')).toHaveValue('Product Manager')
    expect(editDialog.querySelector('input[name="location"]')).toHaveValue('Austin, TX')
    expect(editDialog.querySelector('select[name="status"]')).toHaveValue('Active')
  })

  it('pre-fills a different user when a different Edit button is clicked', () => {
    render(<App />)
    clickEditFor('Mia Chen')
    const editDialog = screen.getByRole('dialog', { name: /Edit User/i })
    expect(editDialog.querySelector('input[name="name"]')).toHaveValue('Mia Chen')
    expect(editDialog.querySelector('select[name="status"]')).toHaveValue('Pending')
  })
})

// AC-3: Valid edit submission updates the row in-place and closes the modal
describe('AC-3: Valid edit updates the row in-place and closes the modal', () => {
  it('updates the user name in the table after a valid edit', () => {
    render(<App />)
    clickEditFor('Noah Patel')
    const editDialog = screen.getByRole('dialog', { name: /Edit User/i })
    fillEditForm(editDialog, { name: 'Noah Patel Updated' })
    fireEvent.click(within(editDialog).getByRole('button', { name: /^Save$/i }))
    expect(screen.getByText('Noah Patel Updated')).toBeInTheDocument()
    expect(screen.queryByText('Noah Patel')).not.toBeInTheDocument()
  })

  it('modal closes after valid edit save', () => {
    render(<App />)
    clickEditFor('Ava Johnson')
    const editDialog = screen.getByRole('dialog', { name: /Edit User/i })
    // Trigger save without changing fields (all fields are pre-filled with valid data)
    fireEvent.click(within(editDialog).getByRole('button', { name: /^Save$/i }))
    // After saving, the edit modal is unmounted (conditionally rendered)
    expect(screen.queryByRole('dialog', { name: /Edit User/i })).not.toBeInTheDocument()
  })

  it('other rows remain unchanged after editing one user', () => {
    render(<App />)
    clickEditFor('Noah Patel')
    const editDialog = screen.getByRole('dialog', { name: /Edit User/i })
    fillEditForm(editDialog, { name: 'Noah Updated' })
    fireEvent.click(within(editDialog).getByRole('button', { name: /^Save$/i }))
    // Other users still present
    expect(screen.getByText('Ava Johnson')).toBeInTheDocument()
    expect(screen.getByText('Mia Chen')).toBeInTheDocument()
  })
})

// AC-4: Invalid edit shows validation errors and does not update the user
describe('AC-4: Invalid edit shows validation errors and blocks update', () => {
  it('shows "Name is required." when name is cleared and Save is clicked', () => {
    render(<App />)
    clickEditFor('Ava Johnson')
    const editDialog = screen.getByRole('dialog', { name: /Edit User/i })
    fillEditForm(editDialog, { name: '' })
    fireEvent.click(within(editDialog).getByRole('button', { name: /^Save$/i }))
    expect(within(editDialog).getByText('Name is required.')).toBeInTheDocument()
    // Original name still in the table (edit dialog still open)
    expect(screen.getAllByText('Ava Johnson').length).toBeGreaterThanOrEqual(1)
  })

  it('shows email format error on invalid email and does not save', () => {
    render(<App />)
    clickEditFor('Ava Johnson')
    const editDialog = screen.getByRole('dialog', { name: /Edit User/i })
    fillEditForm(editDialog, { email: 'not-an-email' })
    fireEvent.click(within(editDialog).getByRole('button', { name: /^Save$/i }))
    expect(within(editDialog).getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.getAllByText('Ava Johnson').length).toBeGreaterThanOrEqual(1)
  })
})

// AC-5: Delete button opens confirmation modal naming the user
describe('AC-5: Delete button opens confirmation modal naming the user', () => {
  it('opens a Delete confirmation modal for the correct user', () => {
    render(<App />)
    clickDeleteFor('Ava Johnson')
    const deleteDialog = screen.getByRole('dialog', { name: /Delete User/i })
    expect(deleteDialog).toBeInTheDocument()
    // Name appears in the modal body (may be split across elements due to <strong> tag)
    expect(within(deleteDialog).getByText('Ava Johnson')).toBeInTheDocument()
  })

  it('names the correct user when a different Delete button is clicked', () => {
    render(<App />)
    clickDeleteFor('Liam Garcia')
    const deleteDialog = screen.getByRole('dialog', { name: /Delete User/i })
    expect(within(deleteDialog).getByText('Liam Garcia')).toBeInTheDocument()
  })
})

// AC-6: Confirming deletion removes the row and closes the modal
describe('AC-6: Confirming deletion removes the row and closes the modal', () => {
  it('removes the deleted user row from the table', () => {
    render(<App />)
    clickDeleteFor('Ava Johnson')
    const deleteDialog = screen.getByRole('dialog', { name: /Delete User/i })
    fireEvent.click(within(deleteDialog).getByRole('button', { name: /^Delete$/i }))
    expect(screen.queryByText('Ava Johnson')).not.toBeInTheDocument()
  })

  it('closes the confirmation modal after confirming', () => {
    render(<App />)
    clickDeleteFor('Ava Johnson')
    const deleteDialog = screen.getByRole('dialog', { name: /Delete User/i })
    fireEvent.click(within(deleteDialog).getByRole('button', { name: /^Delete$/i }))
    expect(screen.queryByRole('dialog', { name: /Delete User/i })).not.toBeInTheDocument()
  })

  it('only removes the target user, leaving other rows intact', () => {
    render(<App />)
    clickDeleteFor('Ava Johnson')
    const deleteDialog = screen.getByRole('dialog', { name: /Delete User/i })
    fireEvent.click(within(deleteDialog).getByRole('button', { name: /^Delete$/i }))
    expect(screen.getByText('Noah Patel')).toBeInTheDocument()
    expect(screen.getByText('Mia Chen')).toBeInTheDocument()
  })
})

// AC-7: Cancelling delete confirmation leaves the row intact and closes the modal
describe('AC-7: Cancelling delete confirmation leaves the row and closes the modal', () => {
  it('keeps the user row when Cancel is clicked', () => {
    render(<App />)
    clickDeleteFor('Sophia Nguyen')
    const deleteDialog = screen.getByRole('dialog', { name: /Delete User/i })
    fireEvent.click(within(deleteDialog).getByRole('button', { name: /^Cancel$/i }))
    expect(screen.getByText('Sophia Nguyen')).toBeInTheDocument()
  })

  it('closes the confirmation modal when Cancel is clicked', () => {
    render(<App />)
    clickDeleteFor('Sophia Nguyen')
    const deleteDialog = screen.getByRole('dialog', { name: /Delete User/i })
    fireEvent.click(within(deleteDialog).getByRole('button', { name: /^Cancel$/i }))
    expect(screen.queryByRole('dialog', { name: /Delete User/i })).not.toBeInTheDocument()
  })
})

// AC-8: Shared UserFormModal — Add User flow continues to work
describe('AC-8: Add User flow still works with shared UserFormModal', () => {
  it('opens the Add User modal with heading "Add User" from toolbar button', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Add User/i }))
    expect(screen.getByRole('dialog', { name: /Add User/i })).toBeInTheDocument()
  })

  it('adds a new user row after valid add submission', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Add User/i }))
    fireEvent.change(screen.getByLabelText(/^Name/i), { target: { name: 'name', value: 'New Person' } })
    fireEvent.change(screen.getByLabelText(/^Email/i), { target: { name: 'email', value: 'new@example.com' } })
    fireEvent.change(screen.getByLabelText(/^Role/i), { target: { name: 'role', value: 'Designer' } })
    fireEvent.change(screen.getByLabelText(/^Location/i), { target: { name: 'location', value: 'Denver, CO' } })
    fireEvent.change(screen.getByLabelText(/^Status/i), { target: { name: 'status', value: 'Active' } })
    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }))
    expect(screen.getByText('New Person')).toBeInTheDocument()
  })
})
