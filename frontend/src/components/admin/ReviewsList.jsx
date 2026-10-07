import { formatDate } from '../../utils/formatDate.js'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import StarRating from '../ui/StarRating.jsx'

// Course reviews have a course and an instructor rating; platform reviews have one.
function Ratings({ review }) {
  if (!review.courseRating) return <StarRating className="text-sm" value={review.rating} />

  return (
    <div className="grid gap-1 text-sm">
      <span className="inline-flex items-center gap-2">
        <span className="w-20 text-muted">Course</span>
        <StarRating value={review.courseRating} />
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="w-20 text-muted">Instructor</span>
        <StarRating value={review.instructorRating} />
      </span>
    </div>
  )
}

function StatusBadge({ isHidden }) {
  return isHidden ? <Badge>Hidden</Badge> : <Badge variant="green">Visible</Badge>
}

function VisibilityAction({ review, pendingId, onToggle }) {
  return (
    <Button
      loading={pendingId === review._id}
      loadingText={review.isHidden ? 'Showing…' : 'Hiding…'}
      onClick={() => onToggle(review)}
      size="sm"
      variant={review.isHidden ? 'outline' : 'danger'}
    >
      {review.isHidden ? 'Show' : 'Hide'}
      <span className="sr-only"> the review by {review.user?.name ?? 'this member'}</span>
    </Button>
  )
}

// A table from md up; below that the same reviews as stacked cards.
function ReviewsList({ reviews, type, pendingId, onToggle }) {
  const isCourse = type === 'course'
  const actionProps = { pendingId, onToggle }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-line bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-semibold" scope="col">
                Reviewer
              </th>
              {isCourse && (
                <th className="px-4 py-3 font-semibold" scope="col">
                  Course
                </th>
              )}
              <th className="px-4 py-3 font-semibold" scope="col">
                Rating
              </th>
              <th className="px-4 py-3 font-semibold" scope="col">
                Comment
              </th>
              <th className="px-4 py-3 font-semibold" scope="col">
                Date
              </th>
              <th className="px-4 py-3 font-semibold" scope="col">
                Status
              </th>
              <th className="px-4 py-3 text-right font-semibold" scope="col">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {reviews.map((review) => (
              <tr className="align-top" key={review._id}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{review.user?.name ?? 'Adesua member'}</p>
                  <p className="text-muted">{review.user?.email}</p>
                </td>
                {isCourse && (
                  <td className="max-w-48 px-4 py-3 text-ink">{review.course?.title ?? '—'}</td>
                )}
                <td className="px-4 py-3">
                  <Ratings review={review} />
                </td>
                <td className="max-w-xs px-4 py-3 text-muted">
                  <p className="line-clamp-3">{review.comment}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">
                  {formatDate(review.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge isHidden={review.isHidden} />
                </td>
                <td className="px-4 py-3 text-right">
                  <VisibilityAction review={review} {...actionProps} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 md:hidden">
        {reviews.map((review) => (
          <li className="rounded-xl border border-line bg-white p-4" key={review._id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">
                  {review.user?.name ?? 'Adesua member'}
                </p>
                <p className="truncate text-sm text-muted">{review.user?.email}</p>
              </div>
              <StatusBadge isHidden={review.isHidden} />
            </div>
            {isCourse && (
              <p className="mt-2 text-sm text-muted">
                On <span className="font-semibold text-ink">{review.course?.title ?? '—'}</span>
              </p>
            )}
            <div className="mt-3">
              <Ratings review={review} />
            </div>
            <p className="mt-3 text-sm leading-6 text-ink">{review.comment}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm text-muted">{formatDate(review.createdAt)}</span>
              <VisibilityAction review={review} {...actionProps} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

export default ReviewsList
