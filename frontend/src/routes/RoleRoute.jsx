import { Outlet } from 'react-router'
import NoPermission from '../components/ui/NoPermission.jsx'
import { useAuth } from '../context/AuthContext.jsx'

// Used inside ProtectedRoute. A wrong role sees a message, not a redirect.
function RoleRoute({ roles }) {
  const { user } = useAuth()

  if (!user || !roles.includes(user.role)) return <NoPermission />

  return <Outlet />
}

export default RoleRoute
