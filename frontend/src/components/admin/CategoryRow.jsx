import Pencil from 'lucide-react/dist/esm/icons/pencil.mjs'
import Trash2 from 'lucide-react/dist/esm/icons/trash-2.mjs'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { deleteCategory, updateCategory } from '../../api/categories.js'
import { getErrorMessage, getFieldErrors } from '../../utils/getErrorMessage.js'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'

function CategoryRow({ category, onRenamed, onDeleted }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function startEditing() {
    setName(category.name)
    setError('')
    setEditing(true)
  }

  async function handleSave(event) {
    event.preventDefault()
    const nextName = name.trim()
    if (nextName === category.name) {
      setEditing(false)
      return
    }

    setError('')
    setSaving(true)
    try {
      const renamed = await updateCategory(category._id, { name: nextName })
      onRenamed(renamed)
      setEditing(false)
      // The api function returns only the category, so this is the backend's own message.
      toast.success('Category updated successfully')
    } catch (saveError) {
      setError(getFieldErrors(saveError).name ?? getErrorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete the "${category.name}" category? This can't be undone.`)) return

    setDeleting(true)
    try {
      await deleteCategory(category._id)
      onDeleted(category._id)
      toast.success('Category deleted successfully')
    } catch (deleteError) {
      // For example "This category has courses. Move them to another category first."
      toast.error(getErrorMessage(deleteError))
      setDeleting(false)
    }
  }

  if (editing) {
    return (
      <li className="p-4">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-start"
          noValidate
          onSubmit={handleSave}
        >
          <div className="flex-1">
            <Input
              aria-label={`New name for ${category.name}`}
              autoFocus
              error={error}
              maxLength={40}
              onChange={(event) => {
                setName(event.target.value)
                setError('')
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setEditing(false)
              }}
              value={name}
            />
          </div>
          <div className="flex gap-2">
            <Button loading={saving} loadingText="Saving…" type="submit">
              Save
            </Button>
            <Button disabled={saving} onClick={() => setEditing(false)} variant="ghost">
              Cancel
            </Button>
          </div>
        </form>
      </li>
    )
  }

  const count = category.courseCount
  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-semibold text-ink">{category.name}</p>
        <p className="text-sm text-muted">
          {category.slug} · {count} published {count === 1 ? 'course' : 'courses'}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button onClick={startEditing} size="sm" variant="outline">
          <Pencil aria-hidden="true" className="size-4" />
          Rename<span className="sr-only"> {category.name}</span>
        </Button>
        <Button
          loading={deleting}
          loadingText="Deleting…"
          onClick={handleDelete}
          size="sm"
          variant="danger"
        >
          <Trash2 aria-hidden="true" className="size-4" />
          Delete<span className="sr-only"> {category.name}</span>
        </Button>
      </div>
    </li>
  )
}

export default CategoryRow
