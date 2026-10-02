import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import Footer from './Footer.jsx'
import Navbar from './Navbar.jsx'

function MainLayout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [location.pathname, location.search, location.hash])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="w-full flex-1" id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
