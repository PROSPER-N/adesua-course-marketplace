import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getCategories } from '../../api/categories.js'
import ErrorMessage from '../ui/ErrorMessage.jsx'
import Reveal from '../ui/Reveal.jsx'
import { getErrorMessage } from '../../utils/getErrorMessage.js'

// Different widths make the loading rows look like real names.
const SKELETON_WIDTHS = ['w-56', 'w-40', 'w-48', 'w-36', 'w-52', 'w-44']

function ExploreCategories() {
  // Each load or retry is a new attempt. A result remembers the attempt it answers,
  // so the section is loading until the latest attempt has its result.
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ attempt: -1, categories: [], error: null })
  const loading = result.attempt !== attempt

  useEffect(() => {
    let ignore = false
    getCategories()
      .then((categories) => {
        if (!ignore) setResult({ attempt, categories, error: null })
      })
      .catch((error) => {
        if (!ignore) setResult({ attempt, categories: [], error })
      })

    return () => {
      ignore = true
    }
  }, [attempt])

  if (!loading && !result.error && result.categories.length === 0) return null

  let content
  if (loading) {
    content = (
      <div aria-hidden="true" className="grid gap-x-12 lg:grid-cols-2">
        {SKELETON_WIDTHS.map((width, index) => (
          <div className="border-b border-line py-3.5" key={index}>
            <div className={`skeleton-shimmer h-7 rounded sm:h-8 ${width}`} />
          </div>
        ))}
      </div>
    )
  } else if (result.error) {
    content = (
      <ErrorMessage
        message={getErrorMessage(result.error)}
        onRetry={() => setAttempt((current) => current + 1)}
        title="Couldn't load the categories"
      />
    )
  } else {
    content = (
      <ul className="grid gap-x-12 lg:grid-cols-2">
        {result.categories.map((category) => (
          <li className="border-b border-line" key={category._id}>
            <Link
              className="group flex items-baseline justify-between gap-4 py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              to={`/courses?category=${category.slug}`}
            >
              <span className="font-serif text-xl font-normal text-ink group-hover:text-brand sm:text-2xl">
                {category.name}
              </span>
              <span className="flex shrink-0 items-center gap-3 text-sm text-muted">
                {category.courseCount > 0 &&
                  `${category.courseCount} ${category.courseCount === 1 ? 'course' : 'courses'}`}
                <ArrowRight
                  aria-hidden="true"
                  className="size-5 text-brand transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section aria-labelledby="categories-heading" className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Reveal
          as="h2"
          className="border-b border-line pb-6 font-serif text-display font-medium text-ink"
          id="categories-heading"
        >
          Explore by category
        </Reveal>
        {content}
      </div>
    </section>
  )
}

export default ExploreCategories
