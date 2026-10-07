import { Star } from 'lucide-react'

const SIZES = {
  sm: 'size-4',
  md: 'size-5',
}

const STARS = [1, 2, 3, 4, 5]

// Five stars filled up to the rating, so 4.5 fills four and a half, with the number beside them.
// Screen readers hear one label, like "Rated 4.5 out of 5".
function StarRating({ value = 0, size = 'sm', showValue = true, className = '' }) {
  const rating = Math.round(value * 10) / 10
  const filled = Math.min(100, Math.max(0, (rating / 5) * 100))
  const iconClass = `${SIZES[size] ?? SIZES.sm} shrink-0`

  return (
    <span
      aria-label={`Rated ${rating} out of 5`}
      className={`inline-flex items-center gap-1.5 ${className}`}
      role="img"
    >
      <span aria-hidden="true" className="relative inline-flex">
        <span className="flex text-line">
          {STARS.map((star) => (
            <Star className={iconClass} fill="currentColor" key={star} strokeWidth={0} />
          ))}
        </span>
        {/* The gold stars are cut off at the rating's share of the width. */}
        <span
          className="absolute inset-y-0 left-0 flex overflow-hidden text-gold"
          style={{ width: `${filled}%` }}
        >
          {STARS.map((star) => (
            <Star className={iconClass} fill="currentColor" key={star} strokeWidth={0} />
          ))}
        </span>
      </span>
      {showValue && (
        <span aria-hidden="true" className="font-semibold text-ink">
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  )
}

export default StarRating
