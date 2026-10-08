import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useLocation } from 'react-router'
import {
  deleteMyCourseReview,
  getCourseReviews,
  getMyCourseReview,
  saveMyCourseReview,
} from '../../api/reviews.js'
import { getErrorMessage } from '../../utils/getErrorMessage.js'
import Button from '../ui/Button.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import ErrorMessage from '../ui/ErrorMessage.jsx'
import MyReview from './MyReview.jsx'
import RatingSummary from './RatingSummary.jsx'
import ReviewList from './ReviewList.jsx'

const PAGE_SIZE = 5

const COURSE_RATINGS = [
  { name: 'courseRating', label: 'Rate the course', shortLabel: 'Course' },
  { name: 'instructorRating', label: 'Rate the instructor', shortLabel: 'Instructor' },
]

// The Reviews section of a course page. reviewer is what the viewer can do: 'enrolled' gets the
// form, 'student' is told to enroll, 'guest' gets a login link, and null (instructors, admins,
// or still checking) just reads. onChange runs after the viewer's own review changes.
function CourseReviews({ courseId, reviewer, onChange }) {
  const location = useLocation()
  // version goes up when the viewer's review changes, so the summary and list load again.
  const [version, setVersion] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${courseId}|${version}|${attempt}`
  const [result, setResult] = useState({ key: '', data: null, error: null })
  const loading = result.key !== requestKey
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    let ignore = false
    getCourseReviews(courseId, { limit: PAGE_SIZE })
      .then((data) => {
        if (!ignore) setResult({ key: requestKey, data, error: null })
      })
      .catch((error) => {
        if (!ignore) setResult({ key: requestKey, data: null, error })
      })

    return () => {
      ignore = true
    }
  }, [courseId, requestKey])

  const loadMyReview = useCallback(() => getMyCourseReview(courseId), [courseId])
  const saveMyReview = useCallback((values) => saveMyCourseReview(courseId, values), [courseId])
  const deleteMyReview = useCallback(() => deleteMyCourseReview(courseId), [courseId])

  function handleMyReviewChange() {
    setVersion((current) => current + 1)
    onChange?.()
  }

  // "Show more" adds the next page under the reviews already shown.
  async function showMore() {
    setLoadingMore(true)
    try {
      const next = await getCourseReviews(courseId, {
        page: result.data.pagination.page + 1,
        limit: PAGE_SIZE,
      })
      setResult((current) => ({
        ...current,
        data: { ...next, items: [...current.data.items, ...next.items] },
      }))
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoadingMore(false)
    }
  }

  let list
  if (loading) {
    list = (
      <div aria-hidden="true" className="grid gap-4">
        <div className="skeleton-shimmer h-40 rounded-xl" />
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
    list = (
      <EmptyState
        message="Students who take this course can leave the first review."
        title="No reviews yet"
      />
    )
  } else {
    const { items, pagination } = result.data
    list = (
      <div className="grid gap-4">
        <ReviewList reviews={items} />
        {pagination.page < pagination.totalPages && (
          <Button
            className="justify-self-start"
            loading={loadingMore}
            loadingText="Loading…"
            onClick={showMore}
            variant="outline"
          >
            Show more reviews
          </Button>
        )}
      </div>
    )
  }

  const summary = !loading && result.data?.summary
  return (
    <section aria-labelledby="reviews-heading" id="reviews">
      <h2 className="font-serif text-3xl font-medium text-ink" id="reviews-heading">
        Reviews
      </h2>
      <div className="mt-4 grid gap-6">
        {summary?.count > 0 && <RatingSummary summary={summary} />}
        {reviewer === 'enrolled' && (
          <MyReview
            load={loadMyReview}
            onChange={handleMyReviewChange}
            ratings={COURSE_RATINGS}
            remove={deleteMyReview}
            save={saveMyReview}
          />
        )}
        {reviewer === 'student' && <p className="text-muted">Enroll to leave a review.</p>}
        {reviewer === 'guest' && (
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
    </section>
  )
}

export default CourseReviews
