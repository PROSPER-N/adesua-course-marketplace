import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getSiteReviews } from '../../api/reviews.js'
import { getInitials } from '../../utils/getInitials.js'
import AutoScroller from '../ui/AutoScroller.jsx'
import Reveal from '../ui/Reveal.jsx'
import StarRating from '../ui/StarRating.jsx'

const REVIEW_LIMIT = 10

const CARD_CLASS = 'w-[85vw] rounded-2xl border border-line bg-card p-6 sm:w-[340px]'

// The newest reviews of Adesua, moving slowly past. The section hides itself when there are
// none, or when they can't be loaded, like the popular courses above it.
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
    <section aria-labelledby="what-people-say-heading" className="py-12 lg:py-16">
      <AutoScroller
        actions={
          <Link
            className="font-semibold text-brand-dark underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            to="/reviews"
          >
            Read all reviews
          </Link>
        }
        getKey={(review) => review._id}
        header={
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.12em] text-brand uppercase">Reviews</p>
            <h2
              className="mt-2 font-serif text-display font-medium text-ink"
              id="what-people-say-heading"
            >
              What people say
            </h2>
          </Reveal>
        }
        items={result.reviews}
        label="reviews"
        placeholder={
          result.loading && (
            <div className="flex gap-5">
              {Array.from({ length: 3 }, (_, index) => (
                <div className={`grid shrink-0 gap-3 ${CARD_CLASS}`} key={index}>
                  <div className="skeleton-shimmer h-5 w-11/12 rounded" />
                  <div className="skeleton-shimmer h-5 w-4/5 rounded" />
                  <div className="skeleton-shimmer h-5 w-2/3 rounded" />
                  <div className="mt-4 flex items-center gap-3">
                    <div className="skeleton-shimmer size-10 rounded-full" />
                    <div className="skeleton-shimmer h-4 w-32 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )
        }
        renderItem={(review) => <ReviewCard review={review} />}
        rowClassName="mt-10"
        speed={20}
      />
    </section>
  )
}

function ReviewCard({ review }) {
  const name = review.user?.name ?? 'Adesua member'

  return (
    <figure className={`flex h-full flex-col ${CARD_CLASS}`}>
      <blockquote className="flex-1 font-serif text-lg leading-relaxed font-normal text-ink">
        <p>{review.comment}</p>
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-dark"
        >
          {getInitials(name) || 'A'}
        </span>
        <span className="min-w-0 flex-1 text-sm">
          <span className="block truncate font-semibold text-ink">{name}</span>
          <span className="block text-muted">
            {review.user?.role === 'instructor' ? 'Instructor' : 'Learner'}
          </span>
        </span>
        <StarRating value={review.rating} />
      </figcaption>
    </figure>
  )
}

export default WhatPeopleSay
