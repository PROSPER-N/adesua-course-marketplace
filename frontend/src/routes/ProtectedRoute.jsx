import { Navigate, Outlet, useLocation } from 'react-router'
import PageLoader from '../components/ui/PageLoader.jsx'
import { useAuth } from '../context/AuthContext.jsx'

// Only logged-in users get through. Guests are sent to /login and the page they wanted is remembered.
function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!user) return <Navigate replace state={{ from: location }} to="/login" />

  return <Outlet />
}

export default ProtectedRoute
