import { Link } from 'react-router'
import { formatMoney } from '../../utils/formatMoney.js'
import StarRating from '../ui/StarRating.jsx'
import CourseCover from './CourseCover.jsx'

// course is one item from GET /api/courses.
function CourseCard({ course }) {
  const {
    _id,
    title,
    instructor,
    category,
    thumbnailUrl,
    lessonCount = 0,
    level,
    price = 0,
    studentCount = 0,
    rating,
  } = course

  const instructorName =
    typeof instructor === 'string' ? instructor : (instructor?.name ?? 'Instructor')

  const levelLabel = level ? level.charAt(0).toUpperCase() + level.slice(1) : ''

  return (
    <Link
      to={`/courses/${_id}`}
      className="group block overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-md"
    >
      <CourseCover title={title} category={category} thumbnailUrl={thumbnailUrl} />

      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 min-h-[3.5rem] font-semibold text-ink group-hover:text-brand">
          {title}
        </h3>

        <p className="truncate text-sm text-muted">{instructorName}</p>

        {/* The row keeps its height without a rating, so cards side by side still line up. */}
        <div className="flex min-h-5 items-center gap-1.5 text-sm">
          {rating?.count > 0 && (
            <>
              <StarRating value={rating.average} />
              <span className="text-muted">
                ({rating.count})
                <span className="sr-only"> {rating.count === 1 ? 'review' : 'reviews'}</span>
              </span>
            </>
          )}
        </div>

        <p className="text-sm text-muted">
          {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
          {levelLabel && ` · ${levelLabel}`}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="font-semibold text-ink">{formatMoney(price)}</span>

          <span className="text-sm text-muted">
            {studentCount} {studentCount === 1 ? 'student' : 'students'}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default CourseCard
