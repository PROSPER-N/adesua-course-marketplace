import { useState } from 'react'
import Button from '../ui/Button.jsx'
import StarInput from '../ui/StarInput.jsx'
import Textarea from '../ui/Textarea.jsx'

const MAX_COMMENT = 1000

// The form for adding or editing a review. ratings lists the star questions, like
// [{ name: 'courseRating', label: 'Rate the course' }]. initial holds an existing review.
function ReviewForm({ ratings, initial, errors = {}, saving, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => ({
    ...Object.fromEntries(ratings.map(({ name }) => [name, initial?.[name] ?? 0])),
    comment: initial?.comment ?? '',
  }))

  function setValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({ ...values, comment: values.comment.trim() })
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        {ratings.map(({ name, label }) => (
          <StarInput
            error={errors[name]}
            key={name}
            label={label}
            onChange={(stars) => setValue(name, stars)}
            value={values[name]}
          />
        ))}
      </div>
      <Textarea
        error={errors.comment}
        hint={`${values.comment.length} / ${MAX_COMMENT} characters`}
        label="Your review"
        maxLength={MAX_COMMENT}
        name="comment"
        onChange={(event) => setValue('comment', event.target.value)}
        placeholder="What was helpful, and what could be better?"
        value={values.comment}
      />
      <div className="flex flex-wrap gap-3">
        <Button loading={saving} loadingText="Saving…" type="submit">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button disabled={saving} onClick={onCancel} variant="outline">
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

export default ReviewForm
