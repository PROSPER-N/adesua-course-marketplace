import { Outlet } from 'react-router'

// STUB. Member C will send logged-in users away from /login and /register.
function GuestRoute() {
  return <Outlet />
}

export default GuestRoute
