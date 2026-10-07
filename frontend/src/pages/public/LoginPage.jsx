import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import Button from '../../components/ui/Button.jsx'
import ErrorMessage from '../../components/ui/ErrorMessage.jsx'
import FormField from '../../components/ui/FormField.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getErrorMessage, getFieldErrors } from '../../utils/getErrorMessage.js'
import { homePathForRole } from '../../utils/homePathForRole.js'

const TABS = [
  {
    id: 'student',
    label: 'Learner',
    to: '/login',
    heading: 'Log in to keep learning',
    panelTitle: 'Pick up where you left off.',
    panelText: 'Your courses and your progress are waiting for you.',
    registerPath: '/register',
  },
  {
    id: 'instructor',
    label: 'Instructor',
    to: '/login?as=instructor',
    heading: 'Log in to teach',
    panelTitle: 'Your courses, your students.',
    panelText: 'Add lessons, publish courses and see how your students are doing.',
    registerPath: '/register?role=instructor',
  },
]

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  // The tab changes only the wording and the sign-up link. Logging in works the same,
  // and the account's own role decides where it goes next.
  const tab = TABS.find(({ id }) => id === searchParams.get('as')) ?? TABS[0]

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bannerError, setBannerError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setBannerError('')

    // Empty fields are caught here, so they don't use up the 20 login attempts per 15 minutes.
    const errors = {}
    if (!form.email.trim()) errors.email = 'Enter a valid email address.'
    if (!form.password) errors.password = 'Enter your password.'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
      const user = await login(form.email.trim(), form.password)
      const from = location.state?.from
      navigate(from ? `${from.pathname}${from.search ?? ''}` : homePathForRole(user.role), {
        replace: true,
      })
    } catch (error) {
      setBannerError(getErrorMessage(error))
      setFieldErrors(getFieldErrors(error))
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-band lg:flex lg:flex-col lg:justify-center lg:px-14 xl:px-20">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, transparent 0 14px, color-mix(in srgb, var(--color-gold) 14%, transparent) 14px 16px)',
          }}
        />
        <div className="relative max-w-md">
          <p className="font-display text-4xl font-extrabold leading-tight text-white xl:text-5xl">
            {tab.panelTitle}
          </p>
          <p className="mt-4 text-lg text-white/80">{tab.panelText}</p>
        </div>
      </aside>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-[420px]">
          {/* Each tab passes on location.state, the page to go back to after logging in. */}
          <nav aria-label="Log in as" className="mb-8 flex gap-6 border-b border-line">
            {TABS.map(({ id, label, to }) => {
              const active = tab.id === id
              return (
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={`-mb-px rounded-t-md border-b-2 px-1 pb-3 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${active ? 'border-brand text-brand-dark' : 'border-transparent text-muted hover:text-ink'}`}
                  key={id}
                  replace
                  state={location.state}
                  to={to}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          <h1 className="font-display text-3xl font-extrabold text-ink">{tab.heading}</h1>
          <p className="mt-2 text-muted">Welcome back. Enter your details to continue.</p>

          <form className="mt-8 grid gap-5" noValidate onSubmit={handleSubmit}>
            {bannerError && <ErrorMessage message={bannerError} title="Couldn't log you in" />}

            <FormField
              autoComplete="email"
              error={fieldErrors.email}
              label="Email"
              name="email"
              onChange={handleChange}
              type="email"
              value={form.email}
            />

            <div className="relative">
              <FormField
                autoComplete="current-password"
                error={fieldErrors.password}
                id="login-password"
                label="Password"
                name="password"
                onChange={handleChange}
                type={showPassword ? 'text' : 'password'}
                value={form.password}
              />
              <button
                aria-controls="login-password"
                aria-pressed={showPassword}
                className="absolute right-0 top-0 rounded-md text-sm font-semibold text-brand hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <Button fullWidth loading={loading} loadingText="Logging in…" type="submit">
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            New to Adesua?{' '}
            <Link className="font-semibold text-brand hover:text-brand-hover" to={tab.registerPath}>
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}

export default LoginPage
