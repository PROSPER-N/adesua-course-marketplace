import { Check } from 'lucide-react'
import ErrorMessage from '../ui/ErrorMessage.jsx'
import { getErrorMessage } from '../../utils/getErrorMessage.js'

const MAX_INTERESTS = 5

// Different widths make the loading chips look like real names.
const SKELETON_WIDTHS = ['w-36', 'w-28', 'w-24', 'w-20', 'w-24', 'w-28', 'w-32']

// A learner's optional interests on the sign-up form: one chip per category, up to 5.
function InterestPicker({ categories, loading, loadError, onRetry, selected, onToggle, error }) {
  const full = selected.length >= MAX_INTERESTS

  let content
  if (loading) {
    content = (
      <div aria-hidden="true" className="flex flex-wrap gap-2">
        {SKELETON_WIDTHS.map((width, index) => (
          <div className={`skeleton-shimmer h-10 rounded-full ${width}`} key={index} />
        ))}
      </div>
    )
  } else if (loadError) {
    content = (
      <ErrorMessage
        message={getErrorMessage(loadError)}
        onRetry={onRetry}
        title="Couldn't load the topics"
      />
    )
  } else if (categories.length === 0) {
    content = <p className="text-sm text-muted">There are no topics to choose from yet.</p>
  } else {
    content = (
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const checked = selected.includes(category._id)
          // Once 5 are chosen, the rest wait until one is unchosen.
          const disabled = full && !checked

          return (
            <label
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand ${checked ? 'border-brand bg-brand-soft text-brand-dark' : 'border-line bg-white text-ink'} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-brand'}`}
              key={category._id}
            >
              <input
                checked={checked}
                className="sr-only"
                disabled={disabled}
                onChange={() => onToggle(category._id)}
                type="checkbox"
              />
              {checked && <Check aria-hidden="true" className="size-4" />}
              {category.name}
            </label>
          )
        })}
      </div>
    )
  }

  return (
    <fieldset aria-describedby="interests-hint" className="grid gap-1.5">
      <legend className="mb-1.5 text-sm font-semibold text-ink">What do you want to learn?</legend>
      <p className="text-sm text-muted" id="interests-hint">
        Optional. Choose up to {MAX_INTERESTS}.
      </p>
      <div className="mt-1">{content}</div>
      {!loading && !loadError && categories.length > 0 && (
        <p aria-live="polite" className="text-sm text-muted">
          {selected.length} of {MAX_INTERESTS} chosen
        </p>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </fieldset>
  )
}

export default InterestPicker
