import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getSiteReviews } from '../../api/reviews.js'
import StarRating from '../ui/StarRating.jsx'

const REVIEW_LIMIT = 3

// The newest reviews of Adesua. The section hides itself when there are none, or when they
// can't be loaded, like the popular courses above it.
function WhatPeopleSay() {
  const [result, setResult] = useState({ loading: true, reviews: [] })

  useEffect(() => {
    let ignore = false

    getSiteReviews({ limit: REVIEW_LIMIT })
      .then(({ items }) => {
        if (!ignore) setResult({ loading: false, reviews: items })
      })
      .catch(() => {
        if (!ignore) setResult({ loading: false, reviews: [] })
      })

    return () => {
      ignore = true
    }
  }, [])

  if (!result.loading && result.reviews.length === 0) return null

  return (
    <section
      aria-labelledby="what-people-say-heading"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-brand-dark uppercase">Reviews</p>
          <h2
            className="mt-2 font-display text-2xl font-extrabold text-ink sm:text-3xl"
            id="what-people-say-heading"
          >
            What people say
          </h2>
        </div>
        <Link
          className="font-semibold text-brand-dark hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          to="/reviews"
        >
          Read all reviews
        </Link>
      </div>

      <ul className="mt-6 grid gap-5 md:grid-cols-3">
        {result.loading
          ? Array.from({ length: REVIEW_LIMIT }, (_, index) => (
              <li aria-hidden="true" className="skeleton-shimmer h-48 rounded-xl" key={index} />
            ))
          : result.reviews.map((review) => (
              <li className="rounded-xl border border-line bg-white p-5" key={review._id}>
                <figure className="flex h-full flex-col">
                  <StarRating value={review.rating} />
                  {/* Long reviews are cut short here; the Reviews page shows them in full. */}
                  <blockquote className="mt-3 flex-1 leading-7 text-ink">
                    <p className="line-clamp-5">{review.comment}</p>
                  </blockquote>
                  <figcaption className="mt-4 text-sm">
                    <span className="font-semibold text-ink">
                      {review.user?.name ?? 'Adesua member'}
                    </span>
                    <span className="text-muted">
                      {' '}
                      · {review.user?.role === 'instructor' ? 'Instructor' : 'Learner'}
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
      </ul>
    </section>
  )
}

export default WhatPeopleSay
