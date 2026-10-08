import { BookOpen, ShoppingCart, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { enrollFree, getMyEnrollments } from '../../api/enrollments.js'
import CourseCover from '../../components/course/CourseCover.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorMessage from '../../components/ui/ErrorMessage.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import { useCart } from '../../hooks/useCart.js'
import { getErrorMessage } from '../../utils/getErrorMessage.js'
import { removeCartItem } from '../../utils/cart.js'

function CartPage() {
  const { formatPrice, formatAmount } = useCurrency()
  const { items } = useCart()
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [enrollmentResult, setEnrollmentResult] = useState({
    userId: '',
    items: [],
    error: null,
  })
  const [enrollmentAttempt, setEnrollmentAttempt] = useState(0)
  const [busyCourseId, setBusyCourseId] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (user?.role !== 'student') return undefined

    let active = true
    getMyEnrollments()
      .then((data) => {
        if (active) setEnrollmentResult({ userId: user._id, items: data, error: null })
      })
      .catch((error) => {
        if (active) setEnrollmentResult({ userId: user._id, items: [], error })
      })

    return () => {
      active = false
    }
  }, [enrollmentAttempt, user?._id, user?.role])

  const enrollments = enrollmentResult.userId === user?._id ? enrollmentResult.items : []
  const enrollmentError = enrollmentResult.userId === user?._id ? enrollmentResult.error : null

  async function handleFreeEnrollment(course) {
    if (!user) return
    setBusyCourseId(course._id)
    setActionError('')
    try {
      await enrollFree(course._id)
      removeCartItem(course._id)
      setEnrollmentResult((current) => ({
        ...current,
        items: [...current.items, { course: { _id: course._id } }],
      }))
      navigate(
        course.firstLessonId ? `/learn/${course._id}/${course.firstLessonId}` : '/my-learning',
      )
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setBusyCourseId('')
    }
  }

  const total = items.reduce((sum, course) => sum + course.price, 0)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <ShoppingCart aria-hidden="true" className="size-7 text-brand" />
        <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Your cart</h1>
      </div>
      <p className="mt-2 text-muted">
        Save courses here and enroll in free courses or check out one paid course at a time.
      </p>

      {actionError && (
        <div className="mt-6">
          <ErrorMessage message={actionError} title="Couldn't update your enrollment" />
        </div>
      )}
      {enrollmentError && (
        <div className="mt-6">
          <ErrorMessage
            message={getErrorMessage(enrollmentError)}
            onRetry={() => setEnrollmentAttempt((current) => current + 1)}
            title="Couldn't check your enrollments"
          />
        </div>
      )}

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            action={<Button to="/courses">Browse courses</Button>}
            icon={ShoppingCart}
            message="Add a course from its details page and it will be saved in this browser."
            title="Your cart is empty"
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <ul className="grid gap-4">
            {items.map((course) => {
              const enrolled = enrollments.some(
                (enrollment) => enrollment.course?._id === course._id,
              )
              const loginState = { from: location }

              return (
                <li
                  className="grid gap-4 rounded-xl border border-line bg-white p-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center"
                  key={course._id}
                >
                  <Link
                    aria-label={`View ${course.title}`}
                    className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    to={`/courses/${course._id}`}
                  >
                    <CourseCover
                      category={course.category}
                      thumbnailUrl={course.thumbnailUrl}
                      title={course.title}
                    />
                  </Link>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link
                          className="font-semibold text-ink hover:text-brand"
                          to={`/courses/${course._id}`}
                        >
                          {course.title}
                        </Link>
                        {course.instructor?.name && (
                          <p className="mt-1 text-sm text-muted">By {course.instructor.name}</p>
                        )}
                        <p className="mt-2 font-display text-xl font-bold text-ink">
                          {formatPrice(course.price)}
                        </p>
                      </div>
                      <button
                        aria-label={`Remove ${course.title} from cart`}
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-danger hover:bg-danger/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        onClick={() => removeCartItem(course._id)}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                        Remove
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {enrolled ? (
                        <Button
                          size="sm"
                          to={
                            course.firstLessonId
                              ? `/learn/${course._id}/${course.firstLessonId}`
                              : '/my-learning'
                          }
                        >
                          Continue learning
                        </Button>
                      ) : authLoading ? (
                        <Button loading size="sm">
                          Checking account…
                        </Button>
                      ) : course.price === 0 ? (
                        user?.role === 'student' ? (
                          <Button
                            loading={busyCourseId === course._id}
                            loadingText="Enrolling…"
                            onClick={() => handleFreeEnrollment(course)}
                            size="sm"
                          >
                            Enroll for free
                          </Button>
                        ) : !user ? (
                          <>
                            <Button size="sm" state={loginState} to="/login">
                              Log in to enroll
                            </Button>
                            <Button size="sm" state={loginState} to="/register" variant="outline">
                              Sign up
                            </Button>
                          </>
                        ) : (
                          <p className="self-center text-sm text-muted">
                            Student accounts can enroll in courses.
                          </p>
                        )
                      ) : !user ? (
                        <Button size="sm" state={loginState} to="/login">
                          Log in to check out
                        </Button>
                      ) : user.role === 'student' ? (
                        <Button size="sm" to={`/checkout/${course._id}?from=cart`}>
                          Continue to checkout
                        </Button>
                      ) : (
                        <p className="self-center text-sm text-muted">
                          Student accounts can check out courses.
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <aside
            aria-label="Cart summary"
            className="rounded-xl border border-line bg-white p-5 lg:sticky lg:top-24"
          >
            <h2 className="font-display text-xl font-bold text-ink">Summary</h2>
            <p className="mt-2 text-sm text-muted">
              {items.length} {items.length === 1 ? 'course' : 'courses'}
            </p>
            <dl className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
              <dt className="font-semibold text-ink">Total</dt>
              <dd className="font-display text-2xl font-extrabold text-ink">
                {formatAmount(total)}
              </dd>
            </dl>
            <p className="mt-3 flex items-start gap-2 text-sm text-muted">
              <BookOpen aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" />
              Each course has its own enrollment or checkout.
            </p>
            <Link
              className="mt-5 inline-flex font-semibold text-brand hover:underline"
              to="/courses"
            >
              Browse more courses
            </Link>
          </aside>
        </div>
      )}

      {authLoading && <span className="sr-only">Checking your account</span>}
    </div>
  )
}

export default CartPage
