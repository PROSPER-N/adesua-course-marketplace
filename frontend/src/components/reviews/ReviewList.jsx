import { formatDate } from '../../utils/formatDate.js'
import { getInitials } from '../../utils/getInitials.js'
import StarRating from '../ui/StarRating.jsx'

// Course reviews show the course and instructor ratings. Platform reviews show one rating,
// and whether a learner or an instructor wrote them.
function ReviewList({ reviews }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
      {reviews.map((review) => {
        const name = review.user?.name ?? 'Adesua member'
        const role = review.user?.role

        return (
          <li className="p-5" key={review._id}>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-dark"
                >
                  {getInitials(name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{name}</p>
                  {role && (
                    <p className="text-sm text-muted">
                      {role === 'instructor' ? 'Instructor' : 'Learner'}
                    </p>
                  )}
                </div>
              </div>
              <time className="text-sm text-muted" dateTime={review.createdAt}>
                {formatDate(review.createdAt)}
              </time>
            </div>
            {review.courseRating ? (
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-2">
                  <span className="text-muted">Course</span>
                  <StarRating value={review.courseRating} />
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="text-muted">Instructor</span>
                  <StarRating value={review.instructorRating} />
                </span>
              </div>
            ) : (
              <StarRating className="mt-3 text-sm" value={review.rating} />
            )}
            <p className="mt-3 whitespace-pre-line leading-7 text-ink">{review.comment}</p>
          </li>
        )
      })}
    </ul>
  )
}

export default ReviewList
