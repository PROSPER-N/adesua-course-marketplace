import { CircleAlert, Star } from 'lucide-react'
import { useId, useState } from 'react'

const STARS = [1, 2, 3, 4, 5]

// A rating from 1 to 5, built from five real radio buttons drawn as stars. The radios give the
// keyboard behaviour for free: Tab moves into the group, and the arrow keys change the rating.
function StarInput({ label, value, onChange, error }) {
  const id = useId()
  const errorId = `${id}-error`
  // Hovering previews a rating before it's chosen.
  const [hovered, setHovered] = useState(0)
  const shown = hovered || value

  return (
    <fieldset aria-describedby={error ? errorId : undefined} className="grid gap-1.5">
      <legend className="mb-1.5 text-sm font-semibold text-ink">{label}</legend>
      <div className="flex w-fit gap-1" onMouseLeave={() => setHovered(0)}>
        {STARS.map((stars) => (
          <label
            className="cursor-pointer rounded-md p-0.5 has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-brand"
            key={stars}
            onMouseEnter={() => setHovered(stars)}
          >
            <input
              checked={value === stars}
              className="sr-only"
              name={id}
              onChange={() => onChange(stars)}
              type="radio"
              value={stars}
            />
            {/* The muted outline keeps an empty star visible; a chosen one is filled gold. */}
            <Star
              aria-hidden="true"
              className="size-8 text-muted"
              fill={stars <= shown ? 'var(--color-gold)' : 'none'}
              strokeWidth={1.5}
            />
            <span className="sr-only">
              {stars} {stars === 1 ? 'star' : 'stars'}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-danger" id={errorId}>
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </fieldset>
  )
}

export default StarInput
