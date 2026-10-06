import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getCourses } from '../../api/courses.js'
import CourseCard from '../course/CourseCard.jsx'
import SkeletonCard from '../ui/SkeletonCard.jsx'

const COURSE_LIMIT = 6

function PopularCourses() {
  const [result, setResult] = useState({ loading: true, courses: [] })

  useEffect(() => {
    let ignore = false

    getCourses({ sort: 'popular', limit: COURSE_LIMIT })
      .then(({ items }) => {
        if (!ignore) setResult({ loading: false, courses: items })
      })
      .catch(() => {
        if (!ignore) setResult({ loading: false, courses: [] })
      })

    return () => {
      ignore = true
    }
  }, [])

  if (!result.loading && result.courses.length === 0) return null

  return (
    <section
      aria-labelledby="popular-courses-heading"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-brand-dark uppercase">
            Learners are choosing
          </p>
          <h2
            className="mt-2 font-display text-2xl font-extrabold text-ink sm:text-3xl"
            id="popular-courses-heading"
          >
            Popular right now
          </h2>
        </div>
        <Link
          className="font-semibold text-brand-dark hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          to="/courses"
        >
          Browse all courses
        </Link>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {result.loading
          ? Array.from({ length: COURSE_LIMIT }, (_, index) => (
              <li key={index}>
                <SkeletonCard />
              </li>
            ))
          : result.courses.map((course) => (
              <li key={course._id}>
                <CourseCard course={course} />
              </li>
            ))}
      </ul>
    </section>
  )
}

export default PopularCourses
