import { FolderOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { createCategory, getCategories } from '../../api/categories.js'
import { getErrorMessage, getFieldErrors } from '../../utils/getErrorMessage.js'
import Button from '../ui/Button.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import ErrorMessage from '../ui/ErrorMessage.jsx'
import Input from '../ui/Input.jsx'
import SkeletonRow from '../ui/SkeletonRow.jsx'
import CategoryRow from './CategoryRow.jsx'

// The same order the API uses: by name, ignoring capital letters.
function sortByName(categories) {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
}

function CategoriesTab() {
  // A result remembers the attempt it answers, so the list loads until the latest attempt has one.
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ attempt: -1, categories: [], error: null })
  const loading = result.attempt !== attempt

  const [name, setName] = useState('')
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    let ignore = false
    getCategories()
      .then((categories) => {
        if (!ignore) setResult({ attempt, categories, error: null })
      })
      .catch((error) => {
        if (!ignore) setResult({ attempt, categories: [], error })
      })

    return () => {
      ignore = true
    }
  }, [attempt])

  function updateCategories(change) {
    setResult((current) => ({ ...current, categories: change(current.categories) }))
  }

  async function handleAdd(event) {
    event.preventDefault()
    setAddError('')
    setAdding(true)
    try {
      const created = await createCategory({ name: name.trim() })
      // A new category has no courses yet, and the create response doesn't include the count.
      updateCategories((categories) => sortByName([...categories, { ...created, courseCount: 0 }]))
      setName('')
      // The api function returns only the category, so this is the backend's own message.
      toast.success('Category created successfully')
    } catch (error) {
      // 400 has a message for the name field; 409 (name taken) and other errors use the general one.
      setAddError(getFieldErrors(error).name ?? getErrorMessage(error))
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-line bg-card px-4">
        {Array.from({ length: 5 }, (_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>
    )
  }

  if (result.error) {
    return (
      <ErrorMessage
        message={getErrorMessage(result.error)}
        onRetry={() => setAttempt((current) => current + 1)}
        title="Couldn't load the categories"
      />
    )
  }

  return (
    <section aria-label="Categories" className="grid gap-5">
      <form
        className="grid gap-2 rounded-xl border border-line bg-card p-4"
        noValidate
        onSubmit={handleAdd}
      >
        <label className="text-sm font-semibold text-ink" htmlFor="new-category">
          Add a category
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <Input
              error={addError}
              id="new-category"
              maxLength={40}
              onChange={(event) => {
                setName(event.target.value)
                setAddError('')
              }}
              placeholder="For example, Data science"
              value={name}
            />
          </div>
          <Button loading={adding} loadingText="Adding…" type="submit">
            Add category
          </Button>
        </div>
      </form>

      {result.categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          message="Add the first one with the form above."
          title="No categories yet"
        />
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-card">
          {result.categories.map((category) => (
            <CategoryRow
              category={category}
              key={category._id}
              onDeleted={(id) =>
                updateCategories((categories) => categories.filter((item) => item._id !== id))
              }
              onRenamed={(renamed) =>
                updateCategories((categories) =>
                  sortByName(
                    categories.map((item) =>
                      item._id === renamed._id
                        ? { ...item, name: renamed.name, slug: renamed.slug }
                        : item,
                    ),
                  ),
                )
              }
            />
          ))}
        </ul>
      )}
    </section>
  )
}

export default CategoriesTab
