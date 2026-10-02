import { Outlet } from 'react-router'

// STUB. Member C will show NoPermission when the logged-in user has the wrong role.
function RoleRoute({ roles: _roles }) {
  return <Outlet />
}

export default RoleRoute
