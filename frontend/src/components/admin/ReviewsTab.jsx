import { MessageSquareText } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router'
import { getAdminReviews, updateReviewVisibility } from '../../api/reviews.js'
import { getErrorMessage } from '../../utils/getErrorMessage.js'
import Button from '../ui/Button.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import ErrorMessage from '../ui/ErrorMessage.jsx'
import Pagination from '../ui/Pagination.jsx'
import Select from '../ui/Select.jsx'
import SkeletonRow from '../ui/SkeletonRow.jsx'
import ReviewsList from './ReviewsList.jsx'

const PAGE_SIZE = 10
const TYPES = ['course', 'site']

function ReviewsTab() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Cleaned before use, because the API answers 400 to a type or page it doesn't accept.
  const type = TYPES.includes(searchParams.get('type')) ? searchParams.get('type') : 'course'
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1)

  const [pendingId, setPendingId] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: '', data: null, error: null })

  // A result remembers the request it answers, so the list loads until the latest request has one.
  const requestKey = `${type}|${page}|${attempt}`
  const loading = result.key !== requestKey

  // Filters replace the history entry, so Back leaves the dashboard instead of
  // stepping through every filter, like the other tabs.
  const updateParams = useCallback(
    (changes) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [name, value] of Object.entries(changes)) {
            if (value) next.set(name, value)
            else next.delete(name)
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  useEffect(() => {
    let ignore = false
    getAdminReviews({ type, page, limit: PAGE_SIZE })
      .then((data) => {
        if (!ignore) setResult({ key: requestKey, data, error: null })
      })
      .catch((error) => {
        if (!ignore) setResult({ key: requestKey, data: null, error })
      })

    return () => {
      ignore = true
    }
  }, [page, requestKey, type])

  async function handleToggle(review) {
    const hide = !review.isHidden
    const author = review.user?.name ?? 'this member'
    const question = hide
      ? `Hide the review by ${author}? It won't show on the site${type === 'course' ? " or count towards the course's rating" : ''} until you show it again.`
      : `Show the review by ${author} on the site again?`
    if (!window.confirm(question)) return

    setPendingId(review._id)
    try {
      const { message, data } = await updateReviewVisibility(type, review._id, hide)
      setResult((current) => {
        if (!current.data) return current
        const items = current.data.items.map((item) =>
          item._id === data._id ? { ...item, isHidden: data.isHidden } : item,
        )
        return { ...current, data: { ...current.data, items } }
      })
      toast.success(message)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setPendingId(null)
    }
  }

  let content
  if (loading) {
    content = (
      <div className="rounded-xl border border-line bg-card px-4">
        {Array.from({ length: 5 }, (_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>
    )
  } else if (result.error) {
    content = (
      <ErrorMessage
        message={getErrorMessage(result.error)}
        onRetry={() => setAttempt((current) => current + 1)}
        title="Couldn't load the reviews"
      />
    )
  } else if (result.data.items.length === 0) {
    const pastTheEnd = result.data.pagination.total > 0
    content = (
      <EmptyState
        action={
          pastTheEnd && (
            <Button onClick={() => updateParams({ page: '' })} variant="outline">
              Go to the first page
            </Button>
          )
        }
        icon={MessageSquareText}
        message={
          pastTheEnd
            ? 'This page is past the end of the list.'
            : type === 'course'
              ? 'Reviews that students leave on courses will show here.'
              : 'Reviews of Adesua from learners and instructors will show here.'
        }
        title={pastTheEnd ? 'No reviews on this page' : 'No reviews yet'}
      />
    )
  } else {
    const { items, pagination } = result.data
    content = (
      <div className="grid gap-4">
        <p className="text-sm text-muted">
          {pagination.total} {pagination.total === 1 ? 'review' : 'reviews'}
        </p>
        <ReviewsList onToggle={handleToggle} pendingId={pendingId} reviews={items} type={type} />
        <Pagination
          onPageChange={(nextPage) => updateParams({ page: nextPage > 1 ? String(nextPage) : '' })}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      </div>
    )
  }

  return (
    <section aria-label="Reviews">
      <div className="mb-5 grid gap-3 sm:max-w-xs">
        <Select
          label="Type"
          onChange={(event) =>
            updateParams({ type: event.target.value === 'site' ? 'site' : '', page: '' })
          }
          value={type}
        >
          <option value="course">Course reviews</option>
          <option value="site">Platform reviews</option>
        </Select>
      </div>
      {content}
    </section>
  )
}

export default ReviewsTab
