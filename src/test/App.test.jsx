import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

const VALID_USER = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  role: 'Designer',
  location: 'Chicago, IL',
  status: 'Active',
}

function fillAndSubmitModal(user) {
  fireEvent.click(screen.getByRole('button', { name: /Add User/i }))
  fireEvent.change(screen.getByLabelText(/^Name/i), { target: { name: 'name', value: user.name } })
  fireEvent.change(screen.getByLabelText(/^Email/i), { target: { name: 'email', value: user.email } })
  fireEvent.change(screen.getByLabelText(/^Role/i), { target: { name: 'role', value: user.role } })
  fireEvent.change(screen.getByLabelText(/^Location/i), { target: { name: 'location', value: user.location } })
  fireEvent.change(screen.getByLabelText(/^Status/i), { target: { name: 'status', value: user.status } })
  fireEvent.click(screen.getByRole('button', { name: /^Add$/i }))
}

// AC-1: "Add User" button is visible on the page
describe('AC-1: Add User button is visible on page load', () => {
  it('renders an "Add User" button above the table', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument()
  })
})

// AC-2: clicking the button opens the modal (modal dialog becomes visible)
describe('AC-2: clicking Add User button opens the modal', () => {
  it('shows a dialog with heading "Add User" when button is clicked', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Add User/i }))
    // Assert the dialog is present and visible (Carbon renders open modals with role=dialog)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-label', 'Add User')
  })
})

// AC-5: new user row appears in table after valid submit
describe('AC-5: new user appears in the table after valid submission', () => {
  it('adds a new row to the table with correct name, email, role, location', () => {
    render(<App />)
    fillAndSubmitModal(VALID_USER)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument()
    expect(screen.getByText('Designer')).toBeInTheDocument()
    expect(screen.getByText('Chicago, IL')).toBeInTheDocument()
  })

  it('shows a status Tag for the new user', () => {
    render(<App />)
    fillAndSubmitModal(VALID_USER)
    // The status text appears inside a Tag; there will be multiple "Active" tags
    const activeTags = screen.getAllByText('Active')
    expect(activeTags.length).toBeGreaterThanOrEqual(1)
  })
})

// AC-6: modal closes after valid submission
// Carbon keeps the Modal DOM node but controls visibility via the "is-visible" CSS class
// on the outer wrapper. When open=false, the wrapper loses "is-visible".
describe('AC-6: modal closes after valid submission', () => {
  it('modal wrapper is no longer visible after successful submit', () => {
    const { container } = render(<App />)
    fillAndSubmitModal(VALID_USER)
    const modalWrapper = container.querySelector('.cds--modal')
    expect(modalWrapper).not.toHaveClass('is-visible')
  })
})

// AC-8: unique auto-incremented IDs (two submits → two different rows, no key collision crash)
describe('AC-8: auto-incremented unique IDs for new users', () => {
  it('renders two distinct new users after two valid submissions', () => {
    render(<App />)
    fillAndSubmitModal(VALID_USER)
    fillAndSubmitModal({ ...VALID_USER, name: 'John Smith', email: 'john.smith@example.com' })
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('John Smith')).toBeInTheDocument()
  })
})

// ── Edit & Delete integration tests (SCRUM-8) ───────────────────────────────

const FIRST_USER_NAME = 'Ava Johnson' // first row in users.json seed data
const FIRST_USER_EMAIL = 'ava.johnson@example.com'
const FIRST_USER_ROLE = 'Product Manager'

// AC-1: Actions column header and per-row icon buttons
describe('AC-1: Actions column appears with Edit and Delete buttons per row', () => {
  it('renders an "Actions" column header in the table', () => {
    render(<App />)
    expect(screen.getByRole('columnheader', { name: /^Actions$/i })).toBeInTheDocument()
  })

  it('renders an Edit icon button for each row', () => {
    render(<App />)
    // 5 seed users → 5 edit buttons
    const editButtons = screen.getAllByRole('button', { name: /^Edit /i })
    expect(editButtons.length).toBe(5)
  })

  it('renders a Delete icon button for each row', () => {
    render(<App />)
    const deleteButtons = screen.getAllByRole('button', { name: /^Delete /i })
    expect(deleteButtons.length).toBe(5)
  })
})

// AC-2: clicking Edit opens pre-populated modal
describe('AC-2: clicking Edit button opens "Edit User" modal pre-populated with user data', () => {
  it('opens a dialog with aria-label "Edit User" on click', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Edit ${FIRST_USER_NAME}`, 'i') }))
    const dialogs = screen.getAllByRole('dialog')
    const editDialog = dialogs.find((d) => d.getAttribute('aria-label') === 'Edit User')
    expect(editDialog).toBeTruthy()
  })

  it('pre-populates the Name field with the user\'s current name', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Edit ${FIRST_USER_NAME}`, 'i') }))
    const editDialog = screen.getAllByRole('dialog').find((d) => d.getAttribute('aria-label') === 'Edit User')
    expect(within(editDialog).getByLabelText(/^Name/i)).toHaveValue(FIRST_USER_NAME)
  })

  it('pre-populates Email, Role, and Location fields', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Edit ${FIRST_USER_NAME}`, 'i') }))
    const editDialog = screen.getAllByRole('dialog').find((d) => d.getAttribute('aria-label') === 'Edit User')
    expect(within(editDialog).getByLabelText(/^Email/i)).toHaveValue(FIRST_USER_EMAIL)
    expect(within(editDialog).getByLabelText(/^Role/i)).toHaveValue(FIRST_USER_ROLE)
  })
})

// AC-4 & AC-8: valid edit updates row without affecting other rows or changing id
describe('AC-4 & AC-8: valid edit updates the user row; other rows and IDs are unaffected', () => {
  it('updates the name cell for the edited user', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Edit ${FIRST_USER_NAME}`, 'i') }))
    const editDialog = screen.getAllByRole('dialog').find((d) => d.getAttribute('aria-label') === 'Edit User')
    fireEvent.change(within(editDialog).getByLabelText(/^Name/i), { target: { name: 'name', value: 'Ava Smith' } })
    fireEvent.click(within(editDialog).getByRole('button', { name: /^Save$/i }))
    expect(screen.getByText('Ava Smith')).toBeInTheDocument()
    // original name gone from the table (not the modal)
    expect(screen.queryByText(FIRST_USER_NAME)).not.toBeInTheDocument()
  })

  it('does not affect other user rows after an edit', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Edit ${FIRST_USER_NAME}`, 'i') }))
    const editDialog = screen.getAllByRole('dialog').find((d) => d.getAttribute('aria-label') === 'Edit User')
    fireEvent.change(within(editDialog).getByLabelText(/^Name/i), { target: { name: 'name', value: 'Ava Smith' } })
    fireEvent.click(within(editDialog).getByRole('button', { name: /^Save$/i }))
    // Second seed user must still be present
    expect(screen.getByText('Noah Patel')).toBeInTheDocument()
  })

  it('closes the edit modal after a valid save (Edit User dialog gone)', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Edit ${FIRST_USER_NAME}`, 'i') }))
    const editDialog = screen.getAllByRole('dialog').find((d) => d.getAttribute('aria-label') === 'Edit User')
    fireEvent.change(within(editDialog).getByLabelText(/^Name/i), { target: { name: 'name', value: 'Ava Smith' } })
    fireEvent.click(within(editDialog).getByRole('button', { name: /^Save$/i }))
    // Edit modal conditionally rendered → should be unmounted
    const remainingDialogs = screen.queryAllByRole('dialog')
    expect(remainingDialogs.every((d) => d.getAttribute('aria-label') !== 'Edit User')).toBe(true)
  })
})

// AC-5: clicking Delete opens danger confirmation modal naming the user
describe('AC-5: clicking Delete opens danger confirmation modal with user name', () => {
  it('opens a modal with heading "Delete {name}?" when Delete is clicked', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Delete ${FIRST_USER_NAME}`, 'i') }))
    expect(
      screen.getByRole('heading', { name: new RegExp(`Delete ${FIRST_USER_NAME}\\?`, 'i') }),
    ).toBeInTheDocument()
  })

  it('modal has a "Delete" primary button and "Cancel" secondary button', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Delete ${FIRST_USER_NAME}`, 'i') }))
    const deleteDialog = screen.getAllByRole('dialog').find((d) =>
      d.getAttribute('aria-label')?.includes(`Delete ${FIRST_USER_NAME}`),
    )
    expect(within(deleteDialog).getByRole('button', { name: /^Delete$/i })).toBeInTheDocument()
    expect(within(deleteDialog).getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
  })
})

// AC-6: Cancel in delete confirmation leaves user in table
describe('AC-6: Cancel in delete confirmation closes modal without removing the user', () => {
  it('user row is still present after Cancel', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Delete ${FIRST_USER_NAME}`, 'i') }))
    const deleteDialog = screen.getAllByRole('dialog').find((d) =>
      d.getAttribute('aria-label')?.includes(`Delete ${FIRST_USER_NAME}`),
    )
    fireEvent.click(within(deleteDialog).getByRole('button', { name: /Cancel/i }))
    expect(screen.getByText(FIRST_USER_NAME)).toBeInTheDocument()
  })
})

// AC-7: Delete in confirmation removes user row from table
describe('AC-7: confirming Delete removes the user row from the table', () => {
  it('user row is absent after confirming delete', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Delete ${FIRST_USER_NAME}`, 'i') }))
    const deleteDialog = screen.getAllByRole('dialog').find((d) =>
      d.getAttribute('aria-label')?.includes(`Delete ${FIRST_USER_NAME}`),
    )
    fireEvent.click(within(deleteDialog).getByRole('button', { name: /^Delete$/i }))
    expect(screen.queryByText(FIRST_USER_NAME)).not.toBeInTheDocument()
  })

  it('other users remain in table after one delete', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Delete ${FIRST_USER_NAME}`, 'i') }))
    const deleteDialog = screen.getAllByRole('dialog').find((d) =>
      d.getAttribute('aria-label')?.includes(`Delete ${FIRST_USER_NAME}`),
    )
    fireEvent.click(within(deleteDialog).getByRole('button', { name: /^Delete$/i }))
    expect(screen.getByText('Noah Patel')).toBeInTheDocument()
  })
})
