import { Link } from 'react-router'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import { getInitials } from '../../utils/getInitials.js'
import StarRating from '../ui/StarRating.jsx'
import CourseCover from './CourseCover.jsx'

// With a mouse, hovering or tabbing to the card lifts it and zooms the photo a little. On touch
// screens it presses in while tapped. With reduced motion only the border and shadow change.
const CARD_CLASS =
  'group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card transition-[translate,scale,box-shadow,border-color] duration-200 ease-out hover:border-brand/40 hover:shadow-[0_12px_32px_var(--color-shadow)] focus-visible:border-brand/40 focus-visible:shadow-[0_12px_32px_var(--color-shadow)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-safe:pointer-fine:hover:-translate-y-1 motion-safe:focus-visible:-translate-y-1 motion-safe:pointer-coarse:active:scale-[0.98]'

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
    rating,
  } = course

  const instructorName =
    typeof instructor === 'string' ? instructor : (instructor?.name ?? 'Instructor')

  const levelLabel = level ? level.charAt(0).toUpperCase() + level.slice(1) : ''

  return (
    <Link className={CARD_CLASS} to={`/courses/${_id}`}>
      {/* The frame keeps the photo inside the card while it zooms. The pill replaces the
          cover's own category label. */}
      <div className="relative overflow-hidden">
        <CourseCover
          category={category}
          className="transition-transform duration-500 ease-out motion-safe:group-hover:scale-105 motion-safe:group-focus-visible:scale-105"
          rounded={false}
          showCategory={false}
          thumbnailUrl={thumbnailUrl}
          title={title}
        />
        <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-night/75 px-2.5 py-1 text-xs font-semibold text-white">
          {category?.name ?? 'Course'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Two lines tall even for short titles, so cards side by side still line up. */}
        <h3 className="line-clamp-2 min-h-[2.5em] font-serif text-title font-semibold text-ink decoration-1 underline-offset-4 group-hover:underline group-focus-visible:underline">
          {title}
        </h3>

        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-dark"
          >
            {getInitials(instructorName) || 'A'}
          </span>
          <span className="truncate">{instructorName}</span>
        </p>

        <p className="mt-2 mb-4 text-sm text-muted">
          {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
          {levelLabel && ` · ${levelLabel}`}
          {studentCount > 0 && ` · ${studentCount} ${studentCount === 1 ? 'student' : 'students'}`}
        </p>

        <div className="mt-auto flex min-h-6 items-center justify-between gap-3 border-t border-line pt-4 text-sm">
          {rating?.count > 0 && (
            <span className="flex items-center gap-1.5">
              <StarRating value={rating.average} />
              <span className="text-muted">
                ({rating.count})
                <span className="sr-only"> {rating.count === 1 ? 'review' : 'reviews'}</span>
              </span>
            </span>
          )}
          <span className="ml-auto text-base font-bold text-ink">{formatPrice(price)}</span>
        </div>
      </div>
    </Link>
  )
}

export default CourseCard
