import { CircleCheck, CreditCard, Info, SearchX, Smartphone } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { getCourse } from '../../api/courses.js'
import { getMyEnrollments } from '../../api/enrollments.js'
import { createOrder, payOrder } from '../../api/orders.js'
import CourseCover from '../../components/course/CourseCover.jsx'
import CurrencyNote from '../../components/layout/CurrencyNote.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorMessage from '../../components/ui/ErrorMessage.jsx'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import { getErrorMessage } from '../../utils/getErrorMessage.js'
import { PAYMENT_METHODS } from '../../utils/paymentMethods.js'
import { removeCartItem } from '../../utils/cart.js'

const METHOD_ICONS = { momo: Smartphone, card: CreditCard }

function CheckoutSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid gap-4 rounded-xl border border-line bg-card p-6">
        <div className="skeleton-shimmer h-6 w-40 rounded" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="skeleton-shimmer h-14 rounded-lg" />
          <div className="skeleton-shimmer h-14 rounded-lg" />
        </div>
        <div className="skeleton-shimmer h-11 rounded-lg" />
      </div>
      <div className="order-first grid gap-4 rounded-xl border border-line bg-card p-6 lg:order-none">
        <div className="skeleton-shimmer aspect-[16/10] rounded-xl" />
        <div className="skeleton-shimmer h-5 w-3/4 rounded" />
        <div className="skeleton-shimmer h-4 w-1/2 rounded" />
      </div>
    </div>
  )
}

function CheckoutPage() {
  const { courseId } = useParams()
  const { formatBaseAmount, formatPrice } = useCurrency()
  const [searchParams] = useSearchParams()

  // A result remembers the request it answers, so the page loads until the latest one has one.
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${courseId}|${attempt}`
  const [result, setResult] = useState({ key: '', course: null, enrolled: false, error: null })
  const loading = result.key !== requestKey

  const [paymentMethod, setPaymentMethod] = useState('momo')
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  // An order from an earlier try that wasn't paid. Retrying pays it instead of making another.
  const [unpaidOrder, setUnpaidOrder] = useState(null)
  const [paidOrder, setPaidOrder] = useState(null)
  const [enrolledWhilePaying, setEnrolledWhilePaying] = useState(false)
  const successHeadingRef = useRef(null)

  useEffect(() => {
    let ignore = false
    Promise.all([getCourse(courseId), getMyEnrollments()])
      .then(([course, enrollments]) => {
        const enrolled = enrollments.some((enrollment) => enrollment.course?._id === course._id)
        if (!ignore) setResult({ key: requestKey, course, enrolled, error: null })
      })
      .catch((error) => {
        if (!ignore) setResult({ key: requestKey, course: null, enrolled: false, error })
      })

    return () => {
      ignore = true
    }
  }, [courseId, requestKey])

  // The success screen replaces the form, so move focus to it for keyboard and screen reader users.
  useEffect(() => {
    if (paidOrder) successHeadingRef.current?.focus()
  }, [paidOrder])

  async function handlePay() {
    setPaying(true)
    setPayError('')
    try {
      let order = unpaidOrder
      if (!order || order.paymentMethod !== paymentMethod) {
        order = await createOrder({ courseId, paymentMethod })
        setUnpaidOrder(order)
      }
      const paid = await payOrder(order._id)
      if (searchParams.get('from') === 'cart') removeCartItem(courseId)
      setPaidOrder(paid.order)
    } catch (error) {
      if (error.response?.status === 409) setEnrolledWhilePaying(true)
      else setPayError(getErrorMessage(error))
    } finally {
      setPaying(false)
    }
  }

  const { course } = result
  let content

  if (loading) {
    content = <CheckoutSkeleton />
  } else if (result.error?.response?.status === 404) {
    content = (
      <EmptyState
        action={<Button to="/courses">Browse courses</Button>}
        icon={SearchX}
        message="It may have been removed, or the link may be wrong."
        title="Course not found"
      />
    )
  } else if (result.error) {
    content = (
      <ErrorMessage
        message={getErrorMessage(result.error)}
        onRetry={() => setAttempt((current) => current + 1)}
        title="Couldn't load this checkout"
      />
    )
  } else if (paidOrder) {
    const firstLesson = course.lessons?.[0]
    content = (
      <section className="mx-auto max-w-xl rounded-2xl border border-line bg-card p-6 text-center sm:p-10">
        <CircleCheck aria-hidden="true" className="mx-auto size-12 text-brand" />
        <h2
          className="mt-4 font-display text-3xl font-extrabold text-ink outline-none"
          ref={successHeadingRef}
          tabIndex={-1}
        >
          Payment successful
        </h2>
        <p className="mt-2 text-muted">You're now enrolled in {course.title}.</p>
        <p className="mt-6 text-sm text-muted">Order reference</p>
        <p className="mt-1 font-mono text-lg font-semibold tracking-wide text-ink">
          {paidOrder.reference}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button to={firstLesson ? `/learn/${course._id}/${firstLesson._id}` : '/my-learning'}>
            Start learning
          </Button>
          <Button to="/my-learning" variant="outline">
            Go to my learning
          </Button>
        </div>
      </section>
    )
  } else if (result.enrolled || enrolledWhilePaying) {
    content = (
      <EmptyState
        action={<Button to="/my-learning">Go to my learning</Button>}
        icon={CircleCheck}
        message="You don't need to pay again. Pick up where you left off in My learning."
        title="You're already enrolled in this course."
      />
    )
  } else if (course.price === 0) {
    content = (
      <EmptyState
        action={<Button to={`/courses/${course._id}`}>Go to the course</Button>}
        icon={Info}
        message="Free courses don't need a checkout."
        title="This course is free. Enroll directly."
      />
    )
  } else {
    content = (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <section className="rounded-xl border border-line bg-card p-5 sm:p-6">
          <fieldset>
            <legend className="font-display text-xl font-bold text-ink">Payment method</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS.map(({ value, label }) => {
                const Icon = METHOD_ICONS[value]
                const selected = paymentMethod === value
                return (
                  <label
                    className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${selected ? 'border-brand bg-brand-soft' : 'border-line hover:bg-surface'}`}
                    key={value}
                  >
                    <input
                      checked={selected}
                      className="size-4 accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      disabled={paying}
                      name="paymentMethod"
                      onChange={() => setPaymentMethod(value)}
                      type="radio"
                      value={value}
                    />
                    <Icon aria-hidden="true" className="size-5 shrink-0 text-brand" />
                    <span className="font-semibold text-ink">{label}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <p className="mt-5 flex items-start gap-2 rounded-lg bg-gold-soft p-3 text-sm text-ink">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            Checkout runs in demo mode. No real money is charged.
          </p>

          {payError && (
            <div className="mt-5">
              <ErrorMessage message={payError} title="The payment didn't go through" />
            </div>
          )}

          <Button
            className="mt-5"
            fullWidth
            loading={paying}
            loadingText="Processing payment…"
            onClick={handlePay}
          >
            Pay {formatBaseAmount(course.price)}
          </Button>
        </section>

        {/* On small screens the summary comes first, so people see what they're buying. */}
        <aside
          aria-label="Order summary"
          className="order-first rounded-xl border border-line bg-card p-5 sm:p-6 lg:order-none"
        >
          <h2 className="font-display text-xl font-bold text-ink">Order summary</h2>
          <CourseCover
            category={course.category}
            className="mt-4"
            thumbnailUrl={course.thumbnailUrl}
            title={course.title}
          />
          <p className="mt-4 font-semibold text-ink">{course.title}</p>
          {course.instructor?.name && (
            <p className="mt-1 text-sm text-muted">By {course.instructor.name}</p>
          )}
          <dl className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <dt className="font-semibold text-ink">Total</dt>
            <dd className="font-display text-2xl font-extrabold text-ink">
              {formatPrice(course.price)}
            </dd>
          </dl>
          <CurrencyNote className="mt-3 text-sm" />
        </aside>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Checkout</h1>
      <div className="mt-8">{content}</div>
    </div>
  )
}

export default CheckoutPage
