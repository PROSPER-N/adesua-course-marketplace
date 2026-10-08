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

  const [featured, ...others] = result.reviews

  return (
    <section
      aria-labelledby="what-people-say-heading"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-brand uppercase">Reviews</p>
          <h2
            className="mt-2 font-serif text-display font-medium text-ink"
            id="what-people-say-heading"
          >
            What people say
          </h2>
        </div>
        <Link
          className="font-semibold text-brand-dark underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          to="/reviews"
        >
          Read all reviews
        </Link>
      </div>

      {result.loading ? (
        <div aria-hidden="true" className="mt-10 grid gap-4">
          <div className="skeleton-shimmer h-8 w-11/12 rounded" />
          <div className="skeleton-shimmer h-8 w-4/5 rounded" />
          <div className="skeleton-shimmer h-8 w-2/3 rounded" />
          <div className="skeleton-shimmer mt-2 h-4 w-48 rounded" />
        </div>
      ) : (
        <>
          {/* The newest review as a large quote, the next ones smaller underneath. */}
          <figure className="mt-10 max-w-4xl">
            <blockquote className="font-serif text-quote text-ink">
              <p className="line-clamp-6">
                <span aria-hidden="true" className="text-brand">
                  “
                </span>
                {featured.comment}
                <span aria-hidden="true" className="text-brand">
                  ”
                </span>
              </p>
            </blockquote>
            <Byline review={featured} />
          </figure>

          {others.length > 0 && (
            <ul className="mt-12 grid gap-10 border-t border-line pt-8 md:grid-cols-2">
              {others.map((review) => (
                <li key={review._id}>
                  <figure>
                    {/* Long reviews are cut short here; the Reviews page shows them in full. */}
                    <blockquote className="font-serif text-xl leading-snug text-ink">
                      <p className="line-clamp-4">{review.comment}</p>
                    </blockquote>
                    <Byline review={review} />
                  </figure>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}

function Byline({ review }) {
  return (
    <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span>
        <span className="font-semibold text-ink">{review.user?.name ?? 'Adesua member'}</span>
        <span className="text-muted">
          {' '}
          · {review.user?.role === 'instructor' ? 'Instructor' : 'Learner'}
        </span>
      </span>
      <StarRating value={review.rating} />
    </figcaption>
  )
}

export default WhatPeopleSay
