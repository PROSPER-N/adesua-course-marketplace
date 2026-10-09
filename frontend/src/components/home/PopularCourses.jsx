import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getCourses } from '../../api/courses.js'
import CourseCard from '../course/CourseCard.jsx'
import AutoStepRow from '../ui/AutoStepRow.jsx'
import Reveal from '../ui/Reveal.jsx'
import SkeletonCard from '../ui/SkeletonCard.jsx'

const COURSE_LIMIT = 8

// Part of the next card always shows at the edge, so it's clear the row scrolls.
const ITEM_CLASS = 'w-[80%] shrink-0 snap-start sm:w-[45%] md:w-[40vw] lg:w-[calc((100%-3rem)/3.3)]'

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
    <section aria-labelledby="popular-courses-heading" className="py-12 lg:py-16">
      <AutoStepRow
        actions={
          <Link
            className="font-semibold text-brand-dark underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            to="/courses"
          >
            Browse all courses
          </Link>
        }
        getKey={(course) => course._id}
        header={
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.12em] text-brand uppercase">
              Learners are choosing
            </p>
            <h2
              className="mt-2 font-serif text-display font-medium text-ink"
              id="popular-courses-heading"
            >
              Popular right now
            </h2>
          </Reveal>
        }
        itemClassName={ITEM_CLASS}
        items={result.courses}
        label="courses"
        placeholder={
          result.loading && (
            <div className="flex gap-5">
              {Array.from({ length: 3 }, (_, index) => (
                <div className={ITEM_CLASS} key={index}>
                  <SkeletonCard className="h-80" />
                </div>
              ))}
            </div>
          )
        }
        renderItem={(course) => <CourseCard course={course} />}
        rowClassName="mt-8"
      />
    </section>
  )
}

export default PopularCourses
