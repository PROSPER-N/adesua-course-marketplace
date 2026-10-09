import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getInstructors } from '../../api/instructors.js'
import { getInitials } from '../../utils/getInitials.js'
import StarRating from '../ui/StarRating.jsx'

const INSTRUCTOR_LIMIT = 6

function FeaturedInstructors() {
  const [result, setResult] = useState({ loading: true, instructors: [] })

  useEffect(() => {
    let ignore = false

    getInstructors({ limit: INSTRUCTOR_LIMIT })
      .then((instructors) => {
        if (!ignore) setResult({ loading: false, instructors })
      })
      .catch(() => {
        if (!ignore) setResult({ loading: false, instructors: [] })
      })

    return () => {
      ignore = true
    }
  }, [])

  if (!result.loading && result.instructors.length === 0) return null

  return (
    <section aria-labelledby="instructors-heading" className="mt-16 lg:mt-20">
      <p className="text-xs font-semibold tracking-[0.12em] text-brand uppercase">Instructors</p>
      <h2 className="mt-2 font-serif text-display font-medium text-ink" id="instructors-heading">
        Learn from people who do the work
      </h2>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.loading
          ? Array.from({ length: 3 }, (_, index) => (
              <li
                aria-hidden="true"
                className="flex gap-4 rounded-xl border border-line bg-card p-5"
                key={index}
              >
                <div className="skeleton-shimmer size-14 shrink-0 rounded-full" />
                <div className="grid flex-1 content-start gap-3 pt-2">
                  <div className="skeleton-shimmer h-5 w-2/3 rounded" />
                  <div className="skeleton-shimmer h-3 w-5/6 rounded" />
                  <div className="skeleton-shimmer h-3 w-1/2 rounded" />
                </div>
              </li>
            ))
          : result.instructors.map((instructor) => (
              <li className="rounded-xl border border-line bg-card p-5" key={instructor._id}>
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-soft font-serif text-xl font-semibold text-brand-dark"
                  >
                    {getInitials(instructor.name)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-serif text-title font-semibold text-ink">
                      {instructor.name}
                    </h3>
                    {instructor.headline && (
                      <p className="mt-1 text-sm text-muted">{instructor.headline}</p>
                    )}
                  </div>
                </div>
                {instructor.rating.count > 0 && (
                  <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                    <StarRating value={instructor.rating.average} />
                    <span>({instructor.rating.count})</span>
                  </p>
                )}
                <p className="mt-3 text-sm text-muted">
                  {instructor.teachingArea ? (
                    <Link
                      className="font-semibold text-brand-dark underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      to={`/courses?category=${instructor.teachingArea.slug}`}
                    >
                      Teaches {instructor.teachingArea.name}
                    </Link>
                  ) : (
                    'Instructor'
                  )}
                  {` · ${instructor.courseCount} ${instructor.courseCount === 1 ? 'course' : 'courses'}`}
                </p>
              </li>
            ))}
      </ul>
    </section>
  )
}

export default FeaturedInstructors
