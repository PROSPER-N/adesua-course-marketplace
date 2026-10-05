import { Link } from 'react-router'
import CourseCover from './CourseCover.jsx'

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
  } = course

  const instructorName =
    typeof instructor === 'string'
      ? instructor
      : instructor?.name ?? 'Instructor'

  const levelLabel = level
    ? level.charAt(0).toUpperCase() + level.slice(1)
    : ''

  return (
    <Link
      to={`/courses/${_id}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
    >
      <CourseCover
        title={title}
        category={category}
        thumbnailUrl={thumbnailUrl}
      />

      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 min-h-[3.5rem] font-semibold text-gray-900 group-hover:text-[var(--color-primary,#1E6B4A)]">
          {title}
        </h3>

        <p className="truncate text-sm text-gray-600">
          {instructorName}
        </p>

        <p className="text-sm text-gray-500">
          {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
          {levelLabel && ` · ${levelLabel}`}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="font-semibold text-gray-900">
        {price === 0 ? 'Free' : `₦${Number(price).toLocaleString()}`}
          </span>

          <span className="text-sm text-gray-500">
            {studentCount} {studentCount === 1 ? 'student' : 'students'}
          </span>
        </div>
      </div>
    </Link>
  )
}
  export default CourseCard