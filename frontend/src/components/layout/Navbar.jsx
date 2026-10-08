import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Menu, ShoppingCart, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../hooks/useCart.js'
import { getInitials } from '../../utils/getInitials.js'
import Button from '../ui/Button.jsx'
import CurrencySelector from './CurrencySelector.jsx'
import ThemeToggle from './ThemeToggle.jsx'

function getLinks(user) {
  if (!user) {
    return [
      { label: 'Browse courses', to: '/courses' },
      { label: 'About', to: '/about' },
    ]
  }

  const linksByRole = {
    student: [
      { label: 'Browse courses', to: '/courses' },
      { label: 'My learning', to: '/my-learning' },
    ],
    instructor: [
      { label: 'Browse courses', to: '/courses' },
      { label: 'Dashboard', to: '/instructor' },
    ],
    admin: [
      { label: 'Admin', to: '/admin' },
      { label: 'Browse courses', to: '/courses' },
    ],
  }

  return linksByRole[user.role] ?? [{ label: 'Browse courses', to: '/courses' }]
}

function NavigationLinks({ links, pathname, onNavigate, mobile = false }) {
  return links.map(({ label, to }) => {
    const active = pathname === to

    return (
      <Link
        aria-current={active ? 'page' : undefined}
        className={`rounded-md px-2 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${active ? 'text-brand-dark' : 'text-muted hover:text-ink'} ${mobile ? 'block w-full' : ''}`}
        key={to}
        onClick={onNavigate}
        to={to}
      >
        {label}
      </Link>
    )
  })
}

function AccountActions({ user, logout, mobile = false, onNavigate }) {
  if (!user) {
    return (
      <div className={`flex gap-2 ${mobile ? 'w-full flex-col' : 'items-center'}`}>
        <Button fullWidth={mobile} onClick={onNavigate} size="sm" to="/login" variant="ghost">
          Log in
        </Button>
        <Button fullWidth={mobile} onClick={onNavigate} size="sm" to="/register">
          Sign up
        </Button>
      </div>
    )
  }

  const firstName = user.name?.trim().split(/\s+/)[0] || 'Account'

  return (
    <div className={`flex ${mobile ? 'w-full flex-col items-start' : 'items-center'} gap-3`}>
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-full bg-gold text-sm font-bold text-on-gold"
        >
          {getInitials(user.name) || 'A'}
        </span>
        <span className="text-sm font-semibold text-ink">{firstName}</span>
      </div>
      <Button
        onClick={async () => {
          await logout()
          onNavigate?.()
        }}
        size="sm"
        variant="ghost"
      >
        Log out
      </Button>
    </div>
  )
}

function Navbar() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const { pathname } = useLocation()
  const [menuState, setMenuState] = useState({ open: false, pathname })
  const menuOpen = menuState.open && menuState.pathname === pathname
  const menuButtonRef = useRef(null)
  const closeButtonRef = useRef(null)
  const drawerRef = useRef(null)
  const links = getLinks(user)

  const closeMenu = useCallback(
    (restoreFocus = true) => {
      setMenuState({ open: false, pathname })
      if (restoreFocus) menuButtonRef.current?.focus()
    },
    [pathname],
  )

  useEffect(() => {
    if (menuState.pathname !== pathname) {
      // Discard the old open state so browser Back cannot reopen the drawer.
      // oxlint-disable-next-line react/set-state-in-effect
      setMenuState({ open: false, pathname })
    }
  }, [menuState.pathname, pathname])

  useEffect(() => {
    if (!menuOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu()
        return
      }

      if (event.key !== 'Tab' || !drawerRef.current) return
      const focusableItems = drawerRef.current.querySelectorAll(
        'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"])',
      )
      const firstItem = focusableItems[0]
      const lastItem = focusableItems[focusableItems.length - 1]

      if (!firstItem || !lastItem) {
        event.preventDefault()
      } else if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen, closeMenu])

  const handleNavigate = () => closeMenu(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          aria-label="Adesua home"
          className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          to="/"
        >
          <span aria-hidden="true" className="brand-mark size-9 rounded-lg" />
          <span className="font-display text-2xl font-extrabold tracking-tight text-brand-dark">
            adesua
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-5 md:flex">
          <NavigationLinks links={links} pathname={pathname} />
          <CurrencySelector />
          <ThemeToggle />
          <CartLink count={items.length} />
          <AccountActions logout={logout} user={user} />
        </nav>

        <CartLink className="ml-auto md:hidden" count={items.length} />

        <button
          aria-controls="mobile-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="inline-flex size-11 items-center justify-center rounded-lg text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:hidden"
          onClick={() => {
            if (menuOpen) closeMenu()
            else setMenuState({ open: true, pathname })
          }}
          ref={menuButtonRef}
          type="button"
        >
          {menuOpen ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <Menu aria-hidden="true" className="size-5" />
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" id="mobile-navigation">
          <button
            aria-label="Close navigation menu"
            className="absolute inset-0 h-full w-full bg-overlay"
            onClick={() => closeMenu()}
            tabIndex={-1}
            type="button"
          />
          <aside
            aria-label="Navigation menu"
            aria-modal="true"
            className="drawer-enter absolute inset-y-0 right-0 flex w-[min(86vw,24rem)] flex-col overflow-y-auto bg-card p-5 shadow-xl"
            ref={drawerRef}
            role="dialog"
          >
            <div className="flex items-center justify-between border-b border-line pb-4">
              <span className="font-display text-xl font-extrabold text-brand-dark">Menu</span>
              <button
                aria-label="Close navigation menu"
                className="inline-flex size-10 items-center justify-center rounded-lg text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                onClick={() => closeMenu()}
                ref={closeButtonRef}
                type="button"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="grid gap-1 py-4">
              <NavigationLinks
                links={links}
                mobile
                onNavigate={handleNavigate}
                pathname={pathname}
              />
            </nav>

            <div className="mt-auto grid gap-5 border-t border-line pt-5">
              <CurrencySelector mobile />
              <ThemeToggle mobile />
              <AccountActions logout={logout} mobile onNavigate={handleNavigate} user={user} />
            </div>
          </aside>
        </div>
      )}
    </header>
  )
}

function CartLink({ count, className = '' }) {
  return (
    <Link
      aria-label={`Cart, ${count} ${count === 1 ? 'course' : 'courses'}`}
      className={`relative inline-flex size-11 items-center justify-center rounded-lg text-brand-dark hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${className}`}
      to="/cart"
    >
      <ShoppingCart aria-hidden="true" className="size-5" />
      <span className="sr-only">Cart</span>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-0.5 top-0.5 flex min-w-5 items-center justify-center rounded-full bg-gold px-1 text-xs font-bold text-on-gold"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}

export default Navbar
