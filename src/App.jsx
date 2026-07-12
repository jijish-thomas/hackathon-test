import {
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
  Tag,
  Theme,
  Tile,
} from '@carbon/react'
import users from './common/users.json'
import './App.css'

const STATUS_TO_TAG = {
  Active: 'green',
  Pending: 'warm-gray',
  Inactive: 'red',
}

function App() {
  const headings = ['Name', 'Email', 'Role', 'Location', 'Status']

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
    </>
  )
}

export default App
