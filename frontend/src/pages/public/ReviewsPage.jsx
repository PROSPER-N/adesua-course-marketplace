import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import {
  deleteMySiteReview,
  getMySiteReview,
  getSiteReviews,
  saveMySiteReview,
} from '../../api/reviews.js'
import MyReview from '../../components/reviews/MyReview.jsx'
import RatingSummary from '../../components/reviews/RatingSummary.jsx'
import ReviewList from '../../components/reviews/ReviewList.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorMessage from '../../components/ui/ErrorMessage.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getErrorMessage } from '../../utils/getErrorMessage.js'

const PAGE_SIZE = 10
const SITE_RATINGS = [{ name: 'rating', label: 'Rate Adesua' }]

// Reviews of Adesua itself. Learners and instructors can add, edit or delete their own;
// admins moderate reviews, so they only read here.
function ReviewsPage() {
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1)

  // version goes up when the viewer's review changes, so the summary and list load again.
  const [version, setVersion] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${page}|${version}|${attempt}`
  const [result, setResult] = useState({ key: '', data: null, error: null })
  const loading = result.key !== requestKey

  useEffect(() => {
    let ignore = false
    getSiteReviews({ page, limit: PAGE_SIZE })
      .then((data) => {
        if (!ignore) setResult({ key: requestKey, data, error: null })
      })
      .catch((error) => {
        if (!ignore) setResult({ key: requestKey, data: null, error })
      })

    return () => {
      ignore = true
    }
  }, [page, requestKey])

  // Each page adds a history entry, so Back returns to the page before.
  const goToPage = (nextPage) => setSearchParams(nextPage > 1 ? { page: String(nextPage) } : {})

  let list
  if (loading) {
    list = (
      <div aria-hidden="true" className="grid gap-4">
        <div className="skeleton-shimmer h-36 rounded-xl" />
        <div className="skeleton-shimmer h-32 rounded-xl" />
      </div>
    )
  } else if (result.error) {
    list = (
      <ErrorMessage
        message={getErrorMessage(result.error)}
        onRetry={() => setAttempt((current) => current + 1)}
        title="Couldn't load the reviews"
      />
    )
  } else if (result.data.items.length === 0) {
    const pastTheEnd = result.data.pagination.total > 0
    list = (
      <EmptyState
        action={
          pastTheEnd && (
            <Button onClick={() => goToPage(1)} variant="outline">
              Go to the first page
            </Button>
          )
        }
        message={
          pastTheEnd
            ? 'This page is past the end of the list.'
            : 'Learners and instructors can share what they think of Adesua here.'
        }
        title={pastTheEnd ? 'No reviews on this page' : 'No reviews yet'}
      />
    )
  } else {
    const { items, pagination } = result.data
    list = (
      <div className="grid gap-6">
        <ReviewList reviews={items} />
        <Pagination
          onPageChange={goToPage}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      </div>
    )
  }

  const summary = !loading && result.data?.summary
  const canReview = ['student', 'instructor'].includes(user?.role)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold tracking-wide text-brand-dark uppercase">Reviews</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
          What people say about Adesua
        </h1>
        <p className="mt-2 text-muted">Reviews from the learners and instructors who use Adesua.</p>
      </header>

      <div className="mt-8 grid gap-6">
        {summary?.count > 0 && <RatingSummary summary={summary} />}
        {!authLoading && canReview && (
          <MyReview
            load={getMySiteReview}
            onChange={() => setVersion((current) => current + 1)}
            ratings={SITE_RATINGS}
            remove={deleteMySiteReview}
            save={saveMySiteReview}
          />
        )}
        {!authLoading && !user && (
          <p className="text-muted">
            <Link
              className="font-semibold text-brand hover:text-brand-hover"
              state={{ from: location }}
              to="/login"
            >
              Log in
            </Link>{' '}
            to leave a review.
          </p>
        )}
        {list}
      </div>
    </div>
  )
}

export default ReviewsPage
