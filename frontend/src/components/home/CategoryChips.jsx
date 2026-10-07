import { Link } from 'react-router'
import ErrorMessage from '../ui/ErrorMessage.jsx'
import { getErrorMessage } from '../../utils/getErrorMessage.js'

// Different widths make the loading chips look like real names.
const SKELETON_WIDTHS = ['w-44', 'w-32', 'w-36', 'w-48', 'w-40', 'w-36', 'w-52']

function CategoryChips({ categories, loading, error, onRetry }) {
  if (!loading && !error && categories.length === 0) return null

  let content
  if (loading) {
    content = (
      <div aria-hidden="true" className="flex flex-wrap gap-3">
        {SKELETON_WIDTHS.map((width, index) => (
          <div className={`skeleton-shimmer h-11 rounded-full ${width}`} key={index} />
        ))}
      </div>
    )
  } else if (error) {
    content = (
      <ErrorMessage
        message={getErrorMessage(error)}
        onRetry={onRetry}
        title="Couldn't load the categories"
      />
    )
  } else {
    content = (
      <ul className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <li key={category._id}>
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 font-semibold text-ink hover:border-brand hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              to={`/courses?category=${category.slug}`}
            >
              {category.name}
              {category.courseCount > 0 && (
                <span className="text-sm font-normal text-muted">
                  {category.courseCount} {category.courseCount === 1 ? 'course' : 'courses'}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section
      aria-labelledby="categories-heading"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <h2
        className="font-display text-2xl font-extrabold text-ink sm:text-3xl"
        id="categories-heading"
      >
        Explore by category
      </h2>
      <div className="mt-6">{content}</div>
    </section>
  )
}

export default CategoryChips
