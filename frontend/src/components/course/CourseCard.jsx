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
      className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      {/* The frame keeps the rounded corners while the photo zooms in on hover. */}
      <div className="overflow-hidden rounded-xl">
        <CourseCover
          category={category}
          className="transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          thumbnailUrl={thumbnailUrl}
          title={title}
        />
      </div>

      <div className="pt-4">
        <p className="truncate text-xs font-semibold tracking-[0.12em] text-brand uppercase">
          {category?.name ?? 'Course'}
        </p>

        {/* Two lines tall even for short titles, so cards side by side still line up. */}
        <h3 className="mt-1.5 line-clamp-2 min-h-[2.5em] font-serif text-title font-semibold text-ink decoration-1 underline-offset-4 group-hover:underline">
          {title}
        </h3>

        <p className="mt-1 truncate text-sm text-muted">{instructorName}</p>

        {/* The row keeps its height without a rating, for the same reason. */}
        <div className="mt-2 flex min-h-5 items-center gap-1.5 text-sm">
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

        <p className="mt-1 text-sm text-muted">
          {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
          {levelLabel && ` · ${levelLabel}`} · {studentCount}{' '}
          {studentCount === 1 ? 'student' : 'students'}
        </p>

        <span className="mt-3 block font-semibold text-ink">{formatMoney(price)}</span>
      </div>
    </Link>
  )
}

export default CourseCard
