import StarRating from '../ui/StarRating.jsx'

const STAR_ROWS = [5, 4, 3, 2, 1]

// The average, the number of reviews and a bar for each star rating, from a review summary.
function RatingSummary({ summary }) {
  const { average, count, breakdown } = summary

  return (
    <div className="grid gap-6 rounded-xl border border-line bg-card p-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-10">
      <div>
        <p
          aria-hidden="true"
          className="font-display text-5xl font-extrabold leading-none text-ink"
        >
          {average.toFixed(1)}
        </p>
        <StarRating className="mt-3" showValue={false} size="md" value={average} />
        <p className="mt-2 text-sm text-muted">
          {count} {count === 1 ? 'review' : 'reviews'}
        </p>
      </div>
      <ul className="grid gap-2">
        {STAR_ROWS.map((stars) => {
          const reviews = breakdown[stars] ?? 0
          const share = count ? (reviews / count) * 100 : 0

          return (
            <li className="flex items-center gap-3 text-sm" key={stars}>
              <span aria-hidden="true" className="w-12 shrink-0 text-muted">
                {stars} {stars === 1 ? 'star' : 'stars'}
              </span>
              <span aria-hidden="true" className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                <span
                  className="block h-full rounded-full bg-gold"
                  style={{ width: `${share}%` }}
                />
              </span>
              <span aria-hidden="true" className="w-6 shrink-0 text-right text-muted">
                {reviews}
              </span>
              <span className="sr-only">
                {stars} {stars === 1 ? 'star' : 'stars'}: {reviews}{' '}
                {reviews === 1 ? 'review' : 'reviews'}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default RatingSummary
