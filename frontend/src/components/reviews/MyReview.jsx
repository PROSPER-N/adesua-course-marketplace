import { Pencil, Trash2 } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import toast from 'react-hot-toast'
import { getErrorMessage, getFieldErrors } from '../../utils/getErrorMessage.js'
import Button from '../ui/Button.jsx'
import ErrorMessage from '../ui/ErrorMessage.jsx'
import StarRating from '../ui/StarRating.jsx'
import ReviewForm from './ReviewForm.jsx'

// The signed-in person's own review. It shows the review with Edit and Delete, or the form when
// there isn't one yet. load, save and remove call the API, and onChange runs after a save or delete.
function MyReview({ ratings, load, save, remove, onChange }) {
  const headingId = useId()
  // Each load or retry is a new attempt, and the review is loading until that attempt answers.
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ attempt: -1, review: null, error: null })
  const loading = result.attempt !== attempt
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    let ignore = false
    load()
      .then((review) => {
        if (!ignore) setResult({ attempt, review, error: null })
      })
      .catch((error) => {
        if (!ignore) setResult({ attempt, review: null, error })
      })

    return () => {
      ignore = true
    }
  }, [attempt, load])

  async function handleSave(values) {
    setSaving(true)
    setErrors({})
    try {
      const { message, data } = await save(values)
      setResult((current) => ({ ...current, review: data }))
      setEditing(false)
      toast.success(message)
      onChange?.()
    } catch (error) {
      // A 400 puts its messages under the fields. Anything else, like 403, gets a toast.
      const fieldErrors = getFieldErrors(error)
      setErrors(fieldErrors)
      if (Object.keys(fieldErrors).length === 0) toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete your review? This can't be undone.")) return

    setDeleting(true)
    try {
      const { message } = await remove()
      setResult((current) => ({ ...current, review: null }))
      setEditing(false)
      toast.success(message)
      onChange?.()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  const review = result.review
  let content
  if (loading) {
    content = <div aria-hidden="true" className="skeleton-shimmer h-40 rounded-xl" />
  } else if (result.error) {
    content = (
      <ErrorMessage
        message={getErrorMessage(result.error)}
        onRetry={() => setAttempt((current) => current + 1)}
        title="Couldn't load your review"
      />
    )
  } else if (review && !editing) {
    content = (
      <div className="rounded-xl border border-line bg-card p-5">
        {review.isHidden && (
          <p className="mb-4 rounded-lg bg-surface px-3 py-2 text-sm text-muted">
            An admin has hidden this review, so only you can see it.
          </p>
        )}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {ratings.map(({ name, shortLabel }) => (
            <span className="inline-flex items-center gap-2" key={name}>
              {shortLabel && <span className="text-muted">{shortLabel}</span>}
              <StarRating value={review[name]} />
            </span>
          ))}
        </div>
        <p className="mt-3 whitespace-pre-line leading-7 text-ink">{review.comment}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            onClick={() => {
              setErrors({})
              setEditing(true)
            }}
            size="sm"
            variant="outline"
          >
            <Pencil aria-hidden="true" className="size-4" />
            Edit
          </Button>
          <Button
            loading={deleting}
            loadingText="Deleting…"
            onClick={handleDelete}
            size="sm"
            variant="danger"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Delete
          </Button>
        </div>
      </div>
    )
  } else {
    content = (
      <div className="rounded-xl border border-line bg-card p-5">
        <ReviewForm
          errors={errors}
          initial={review}
          onCancel={review ? () => setEditing(false) : undefined}
          onSubmit={handleSave}
          ratings={ratings}
          saving={saving}
          submitLabel={review ? 'Save changes' : 'Post review'}
        />
      </div>
    )
  }

  return (
    <section aria-labelledby={headingId}>
      <h3 className="font-display text-lg font-bold text-ink" id={headingId}>
        {review || loading ? 'Your review' : 'Leave a review'}
      </h3>
      <div className="mt-3">{content}</div>
    </section>
  )
}

export default MyReview
