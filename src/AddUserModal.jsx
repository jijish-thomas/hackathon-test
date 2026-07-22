import { useState } from 'react'
import {
  Form,
  Modal,
  Select,
  SelectItem,
  Stack,
  TextInput,
} from '@carbon/react'

const EMPTY_FORM = {
  name: '',
  email: '',
  role: '',
  location: '',
  status: '',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(fields) {
  const errors = {}
  if (!fields.name.trim()) errors.name = 'Name is required.'
  if (!fields.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_RE.test(fields.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  if (!fields.role.trim()) errors.role = 'Role is required.'
  if (!fields.location.trim()) errors.location = 'Location is required.'
  if (!fields.status) errors.status = 'Status is required.'
  return errors
}

function AddUserModal({ isOpen, onClose, onAddUser, onSaveUser, initialUser }) {
  const isEditMode = Boolean(initialUser)
  const [fields, setFields] = useState(
    initialUser
      ? {
          name: initialUser.name,
          email: initialUser.email,
          role: initialUser.role,
          location: initialUser.location,
          status: initialUser.status,
        }
      : EMPTY_FORM,
  )
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleClose() {
    setFields(EMPTY_FORM)
    setErrors({})
    onClose()
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(fields)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    const payload = {
      name: fields.name.trim(),
      email: fields.email.trim(),
      role: fields.role.trim(),
      location: fields.location.trim(),
      status: fields.status,
    }
    if (isEditMode) {
      onSaveUser({ ...initialUser, ...payload })
    } else {
      onAddUser(payload)
    }
    setFields(EMPTY_FORM)
    setErrors({})
  }

  return (
    <Modal
      open={isOpen}
      modalHeading={isEditMode ? 'Edit User' : 'Add User'}
      primaryButtonText={isEditMode ? 'Save' : 'Add'}
      secondaryButtonText="Cancel"
      onRequestClose={handleClose}
      onSecondarySubmit={handleClose}
      onRequestSubmit={handleSubmit}
    >
      <Form onSubmit={handleSubmit}>
        <Stack gap={5}>
          <TextInput
            id="user-name"
            name="name"
            labelText="Name"
            placeholder="Full name"
            value={fields.name}
            onChange={handleChange}
            invalid={!!errors.name}
            invalidText={errors.name}
          />
          <TextInput
            id="user-email"
            name="email"
            labelText="Email"
            placeholder="user@example.com"
            value={fields.email}
            onChange={handleChange}
            invalid={!!errors.email}
            invalidText={errors.email}
          />
          <TextInput
            id="user-role"
            name="role"
            labelText="Role"
            placeholder="e.g. Frontend Engineer"
            value={fields.role}
            onChange={handleChange}
            invalid={!!errors.role}
            invalidText={errors.role}
          />
          <TextInput
            id="user-location"
            name="location"
            labelText="Location"
            placeholder="e.g. Austin, TX"
            value={fields.location}
            onChange={handleChange}
            invalid={!!errors.location}
            invalidText={errors.location}
          />
          <Select
            id="user-status"
            name="status"
            labelText="Status"
            value={fields.status}
            onChange={handleChange}
            invalid={!!errors.status}
            invalidText={errors.status}
          >
            <SelectItem value="" text="Select a status" />
            <SelectItem value="Active" text="Active" />
            <SelectItem value="Pending" text="Pending" />
            <SelectItem value="Inactive" text="Inactive" />
          </Select>
        </Stack>
      </Form>
    </Modal>
  )
}

export default AddUserModal
