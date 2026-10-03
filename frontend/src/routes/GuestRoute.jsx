import { Navigate, Outlet, useLocation } from 'react-router'
import PageLoader from '../components/ui/PageLoader.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { homePathForRole } from '../utils/homePathForRole.js'

// For /login and /register. Logged-in users are sent to their home page.
function GuestRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />

  if (user) {
    // Logging in makes this redirect run before the login page can send the user back,
    // so it also has to honour the page they came from.
    const from = location.state?.from
    const target = from ? `${from.pathname}${from.search ?? ''}` : homePathForRole(user.role)
    return <Navigate replace to={target} />
  }

  return <Outlet />
}

export default GuestRoute
