import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'
import { ScrollTrigger } from '../../utils/gsap.js'
import Footer from './Footer.jsx'
import Navbar from './Navbar.jsx'

function MainLayout() {
  const location = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [location.pathname, location.search, location.hash])

  // Scroll animations measure where their sections sit. Sections load their data and photos
  // after the page appears, which moves everything below them, so measure again (at most every
  // 150 ms) when the page changes size, when a photo loads, and after each new page.
  useEffect(() => {
    const main = mainRef.current
    let timer = 0
    const refresh = () => {
      clearTimeout(timer)
      timer = setTimeout(() => ScrollTrigger.refresh(), 150)
    }

    const observer = new ResizeObserver(refresh)
    observer.observe(main)
    // load doesn't bubble, so it's caught on the way down instead.
    main.addEventListener('load', refresh, true)
    refresh()

    return () => {
      clearTimeout(timer)
      observer.disconnect()
      main.removeEventListener('load', refresh, true)
    }
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="w-full flex-1" id="main-content" ref={mainRef}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
