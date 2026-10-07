import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { getCategories } from '../../api/categories.js'
import InterestPicker from '../../components/auth/InterestPicker.jsx'
import Button from '../../components/ui/Button.jsx'
import ErrorMessage from '../../components/ui/ErrorMessage.jsx'
import FormField from '../../components/ui/FormField.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getErrorMessage, getFieldErrors } from '../../utils/getErrorMessage.js'
import { homePathForRole } from '../../utils/homePathForRole.js'

const ROLE_OPTIONS = [
  { value: 'student', title: 'Learn', description: 'Browse and enroll in courses' },
  { value: 'instructor', title: 'Teach', description: 'Create and publish courses' },
]

const PANEL_TEXT = {
  student: {
    title: 'Learn practical skills.',
    text: 'Short courses from people who use these skills every day.',
  },
  instructor: {
    title: 'Teach what you know.',
    text: 'Create courses, add lessons and reach learners around the world.',
  },
}

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [form, setForm] = useState({
    role: searchParams.get('role') === 'instructor' ? 'instructor' : 'student',
    name: '',
    email: '',
    password: '',
    headline: '',
    teachingArea: '',
    interests: [],
  })
  const [loading, setLoading] = useState(false)
  const [bannerError, setBannerError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const isInstructor = form.role === 'instructor'
  const panel = PANEL_TEXT[form.role]

  // The categories give learners their interests and instructors their teaching areas.
  // Each load or retry is a new attempt, and the list is loading until that attempt answers.
  const [attempt, setAttempt] = useState(0)
  const [categoryResult, setCategoryResult] = useState({ attempt: -1, categories: [], error: null })
  const categoriesLoading = categoryResult.attempt !== attempt
  const categoriesError = categoriesLoading ? null : categoryResult.error

  useEffect(() => {
    let ignore = false
    getCategories()
      .then((categories) => {
        if (!ignore) setCategoryResult({ attempt, categories, error: null })
      })
      .catch((error) => {
        if (!ignore) setCategoryResult({ attempt, categories: [], error })
      })

    return () => {
      ignore = true
    }
  }, [attempt])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function toggleInterest(id) {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(id)
        ? current.interests.filter((interest) => interest !== id)
        : [...current.interests, id],
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setBannerError('')
    setFieldErrors({})
    setLoading(true)

    try {
      // Only the chosen role's own fields are sent.
      const profile = isInstructor
        ? { headline: form.headline.trim(), teachingArea: form.teachingArea }
        : { interests: form.interests }
      const user = await register({
        role: form.role,
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        ...profile,
      })
      const firstName = user.name.trim().split(/\s+/)[0]
      toast.success(`Welcome to Adesua, ${firstName}!`)
      const from = location.state?.from
      navigate(
        from && user.role === 'student'
          ? `${from.pathname}${from.search ?? ''}`
          : homePathForRole(user.role),
        { replace: true },
      )
    } catch (error) {
      // 400: messages go under their fields. 409 (email taken) and other errors: the banner.
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
            {panel.title}
          </p>
          <p className="mt-4 text-lg text-white/80">{panel.text}</p>
        </div>
      </aside>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-[420px]">
          <h1 className="font-display text-3xl font-extrabold text-ink">Create your account</h1>
          <p className="mt-2 text-muted">It takes less than a minute.</p>

          <form className="mt-8 grid gap-5" noValidate onSubmit={handleSubmit}>
            {bannerError && (
              <ErrorMessage message={bannerError} title="Couldn't create your account" />
            )}

            <fieldset className="grid gap-1.5">
              <legend className="mb-1.5 text-sm font-semibold text-ink">I want to</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {ROLE_OPTIONS.map((option) => (
                  <label
                    className="flex cursor-pointer flex-col gap-1 rounded-lg border border-line bg-card p-4 has-checked:border-brand has-checked:bg-brand-soft has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand"
                    key={option.value}
                  >
                    <input
                      checked={form.role === option.value}
                      className="sr-only"
                      name="role"
                      onChange={handleChange}
                      type="radio"
                      value={option.value}
                    />
                    <span className="font-semibold text-ink">{option.title}</span>
                    <span className="text-sm text-muted">{option.description}</span>
                  </label>
                ))}
              </div>
              {fieldErrors.role && <p className="text-sm text-danger">{fieldErrors.role}</p>}
            </fieldset>

            <FormField
              autoComplete="name"
              error={fieldErrors.name}
              label="Full name"
              name="name"
              onChange={handleChange}
              value={form.name}
            />

            <FormField
              autoComplete="email"
              error={fieldErrors.email}
              label="Email"
              name="email"
              onChange={handleChange}
              type="email"
              value={form.email}
            />

            <FormField
              autoComplete="new-password"
              error={fieldErrors.password}
              hint="At least 8 characters, with a letter and a number."
              label="Password"
              name="password"
              onChange={handleChange}
              type="password"
              value={form.password}
            />

            {isInstructor ? (
              <>
                <Input
                  error={fieldErrors.headline}
                  hint="Shown under your name on your course pages."
                  label="Professional headline"
                  maxLength={80}
                  name="headline"
                  onChange={handleChange}
                  placeholder="Web developer and teacher"
                  value={form.headline}
                />
                <Select
                  disabled={categoriesLoading}
                  error={fieldErrors.teachingArea}
                  label="Main teaching area"
                  name="teachingArea"
                  onChange={handleChange}
                  value={form.teachingArea}
                >
                  <option value="">
                    {categoriesLoading ? 'Loading areas…' : 'Choose an area'}
                  </option>
                  {categoryResult.categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                {categoriesError && (
                  <ErrorMessage
                    message={getErrorMessage(categoriesError)}
                    onRetry={() => setAttempt((current) => current + 1)}
                    title="Couldn't load the teaching areas"
                  />
                )}
              </>
            ) : (
              <InterestPicker
                categories={categoryResult.categories}
                error={fieldErrors.interests}
                loadError={categoriesError}
                loading={categoriesLoading}
                onRetry={() => setAttempt((current) => current + 1)}
                onToggle={toggleInterest}
                selected={form.interests}
              />
            )}

            <Button fullWidth loading={loading} loadingText="Creating account…" type="submit">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link className="font-semibold text-brand hover:text-brand-hover" to="/login">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}

export default RegisterPage
