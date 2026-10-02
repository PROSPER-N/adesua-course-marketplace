import { Outlet } from 'react-router'

// STUB. Member C will send guests to /login when there is no logged-in user.
function ProtectedRoute() {
  return <Outlet />
}

export default ProtectedRoute
