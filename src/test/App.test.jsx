import { render, screen, fireEvent } from '@testing-library/react'
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
