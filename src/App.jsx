import { useState } from 'react'
import {
  Button,
  Column,
  Content,
  Grid,
  Header,
  HeaderName,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  Tag,
  Theme,
  Tile,
} from '@carbon/react'
import { Add } from '@carbon/icons-react'
import initialUsers from './common/users.json'
import AddUserModal from './AddUserModal'
import './App.css'

const STATUS_TO_TAG = {
  Active: 'green',
  Pending: 'warm-gray',
  Inactive: 'red',
}

function App() {
  const [users, setUsers] = useState(initialUsers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const headings = ['Name', 'Email', 'Role', 'Location', 'Status']

  function handleAddUser(newUserFields) {
    const nextId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1
    setUsers((prev) => [...prev, { id: nextId, ...newUserFields }])
    setIsModalOpen(false)
  }

  return (
    <>
      <Theme theme="g100">
        <Header aria-label="Hackathon Users App">
          <HeaderName href="#" prefix="Hackathon">
            Users
          </HeaderName>
        </Header>
      </Theme>

      <Content id="main-content" className="page-content">
        <Grid fullWidth className="page-grid">
          <Column sm={4} md={8} lg={16}>
            <Tile className="intro-tile">
              <h1>Users Directory</h1>
              <p>
                Frontend-only view using IBM Carbon. Data is loaded from a shared
                JSON file so we can swap to a backend API later.
              </p>
            </Tile>
          </Column>

          <Column sm={4} md={8} lg={16}>
            <TableContainer
              title="Team Users"
              description="Source: src/common/users.json"
            >
              <TableToolbar>
                <TableToolbarContent>
                  <Button
                    renderIcon={Add}
                    onClick={() => setIsModalOpen(true)}
                  >
                    Add User
                  </Button>
                </TableToolbarContent>
              </TableToolbar>
              <Table size="lg" useZebraStyles aria-label="Users table">
                <TableHead>
                  <TableRow>
                    {headings.map((heading) => (
                      <TableHeader key={heading}>{heading}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.location}</TableCell>
                      <TableCell>
                        <Tag type={STATUS_TO_TAG[user.status] ?? 'cool-gray'}>
                          {user.status}
                        </Tag>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Column>
        </Grid>
      </Content>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUser={handleAddUser}
      />
    </>
  )
}

export default App
