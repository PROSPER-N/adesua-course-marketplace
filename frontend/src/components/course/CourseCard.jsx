import { Link } from 'react-router'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import CourseCover from './CourseCover.jsx'

// course is one item from GET /api/courses.
function CourseCard({ course }) {
  const { formatPrice } = useCurrency()
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

        <p className="text-sm text-muted">
          {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
          {levelLabel && ` · ${levelLabel}`}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="font-semibold text-ink">{formatPrice(price)}</span>

          <span className="text-sm text-muted">
            {studentCount} {studentCount === 1 ? 'student' : 'students'}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default CourseCard
