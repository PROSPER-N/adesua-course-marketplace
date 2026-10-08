import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { getCourses } from '../../api/courses.js'
import CourseCard from '../course/CourseCard.jsx'
import SkeletonCard from '../ui/SkeletonCard.jsx'

const COURSE_LIMIT = 8

// Part of the next card always shows at the edge, so it's clear the row scrolls.
const ITEM_CLASS = 'w-[80%] shrink-0 snap-start sm:w-[45%] lg:w-[calc((100%-3rem)/3.3)]'

const ARROW_CLASS =
  'inline-flex size-10 items-center justify-center rounded-full border border-field text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40'

function PopularCourses() {
  const [result, setResult] = useState({ loading: true, courses: [] })
  const rowRef = useRef(null)
  // Whether the row is at its start or end, so the matching arrow can be turned off.
  const [edges, setEdges] = useState({ atStart: true, atEnd: true })

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

  function updateEdges() {
    const row = rowRef.current
    if (!row) return
    setEdges({
      atStart: row.scrollLeft <= 1,
      atEnd: row.scrollLeft + row.clientWidth >= row.scrollWidth - 1,
    })
  }

  // The edges also change when the cards arrive or the window is resized.
  useEffect(() => {
    const row = rowRef.current
    if (!row) return undefined
    const observer = new ResizeObserver(updateEdges)
    observer.observe(row)
    return () => observer.disconnect()
  }, [result.loading])

  // Moves about one screen of cards. The row's CSS makes it smooth, or instant with reduced motion.
  function scrollRow(direction) {
    const row = rowRef.current
    row.scrollBy({ left: direction * row.clientWidth * 0.9 })
  }

  if (!result.loading && result.courses.length === 0) return null

  return (
    <section aria-labelledby="popular-courses-heading" className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-brand uppercase">
              Learners are choosing
            </p>
            <h2
              className="mt-2 font-serif text-display font-medium text-ink"
              id="popular-courses-heading"
            >
              Popular right now
            </h2>
          </div>
          <div className="flex items-center gap-5">
            <Link
              className="font-semibold text-brand-dark underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              to="/courses"
            >
              Browse all courses
            </Link>
            {/* Phones and tablets swipe the row; the arrows help with a mouse. */}
            <div className="hidden gap-2 md:flex">
              <button
                aria-label="Scroll back through the courses"
                className={ARROW_CLASS}
                disabled={edges.atStart}
                onClick={() => scrollRow(-1)}
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="size-5" />
              </button>
              <button
                aria-label="Scroll forward through the courses"
                className={ARROW_CLASS}
                disabled={edges.atEnd}
                onClick={() => scrollRow(1)}
                type="button"
              >
                <ChevronRight aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>
        </div>

        {/* scroll-px matches px, or snapping would pull the first card to the screen edge.
            relative keeps the cards' screen-reader text inside the row, so it can't widen the page. */}
        <ul
          className="relative -mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:thin] motion-reduce:scroll-auto sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8"
          onScroll={updateEdges}
          ref={rowRef}
        >
          {result.loading
            ? Array.from({ length: 4 }, (_, index) => (
                <li className={ITEM_CLASS} key={index}>
                  <SkeletonCard framed={false} />
                </li>
              ))
            : result.courses.map((course) => (
                <li className={ITEM_CLASS} key={course._id}>
                  <CourseCard course={course} />
                </li>
              ))}
        </ul>
      </div>
    </section>
  )
}

export default PopularCourses
