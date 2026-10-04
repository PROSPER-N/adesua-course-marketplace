import SearchX from 'lucide-react/dist/esm/icons/search-x.mjs'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router'
import { getUsers, updateUserStatus } from '../../api/admin.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { getErrorMessage } from '../../utils/getErrorMessage.js'
import Button from '../ui/Button.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import ErrorMessage from '../ui/ErrorMessage.jsx'
import Input from '../ui/Input.jsx'
import Pagination from '../ui/Pagination.jsx'
import Select from '../ui/Select.jsx'
import SkeletonRow from '../ui/SkeletonRow.jsx'
import UsersList from './UsersList.jsx'

const PAGE_SIZE = 10
const SEARCH_DELAY = 400
const ROLES = ['student', 'instructor', 'admin']

function UsersTab() {
  const { user: currentUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  // Cleaned before use, because the API answers 400 to a role or page it doesn't accept.
  const search = (searchParams.get('search') ?? '').trim()
  const role = ROLES.includes(searchParams.get('role')) ? searchParams.get('role') : ''
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1)

  const [searchText, setSearchText] = useState(search)
  const [pendingId, setPendingId] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: '', data: null, error: null })

  // A result remembers the request it answers, so the list loads until the latest request has one.
  const requestKey = `${search}|${role}|${page}|${attempt}`
  const loading = result.key !== requestKey

  // Filters replace the history entry, so Back leaves the dashboard instead of
  // stepping through every search, and the search box always matches the URL.
  const updateParams = useCallback(
    (changes) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [name, value] of Object.entries(changes)) {
            if (value) next.set(name, value)
            else next.delete(name)
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  // Search once typing has stopped for a moment, starting again from page 1.
  useEffect(() => {
    const text = searchText.trim()
    if (text === search) return undefined

    const timer = setTimeout(() => updateParams({ search: text, page: '' }), SEARCH_DELAY)
    return () => clearTimeout(timer)
  }, [search, searchText, updateParams])

  useEffect(() => {
    let ignore = false
    getUsers({ search: search || undefined, role: role || undefined, page, limit: PAGE_SIZE })
      .then((data) => {
        if (!ignore) setResult({ key: requestKey, data, error: null })
      })
      .catch((error) => {
        if (!ignore) setResult({ key: requestKey, data: null, error })
      })

    return () => {
      ignore = true
    }
  }, [page, requestKey, role, search])

  function clearFilters() {
    setSearchText('')
    setSearchParams({ tab: 'users' }, { replace: true })
  }

  async function handleToggleStatus(user) {
    const activate = !user.isActive
    const question = activate
      ? `Activate ${user.name}? They'll be able to log in again.`
      : `Deactivate ${user.name}? They won't be able to log in until you activate the account again.`
    if (!window.confirm(question)) return

    setPendingId(user._id)
    try {
      const updated = await updateUserStatus(user._id, activate)
      setResult((current) => {
        if (!current.data) return current
        const items = current.data.items.map((item) =>
          item._id === updated._id ? { ...item, isActive: updated.isActive } : item,
        )
        return { ...current, data: { ...current.data, items } }
      })
      // The api function returns only the user, so these are the backend's own words.
      toast.success(updated.isActive ? 'User reactivated' : 'User deactivated')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setPendingId(null)
    }
  }

  const filtered = Boolean(search || role)
  let content
  if (loading) {
    content = (
      <div className="rounded-xl border border-line bg-white px-4">
        {Array.from({ length: 5 }, (_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>
    )
  } else if (result.error) {
    content = (
      <ErrorMessage
        message={getErrorMessage(result.error)}
        onRetry={() => setAttempt((current) => current + 1)}
        title="Couldn't load the users"
      />
    )
  } else if (result.data.items.length === 0) {
    content = (
      <EmptyState
        action={
          <Button onClick={clearFilters} variant="outline">
            Clear filters
          </Button>
        }
        icon={SearchX}
        message={
          filtered
            ? 'Try another name or email, or show all roles.'
            : 'This page is past the end of the list.'
        }
        title={filtered ? 'No users match your search' : 'No users on this page'}
      />
    )
  } else {
    const { items, pagination } = result.data
    content = (
      <div className="grid gap-4">
        <p className="text-sm text-muted">
          {pagination.total} {pagination.total === 1 ? 'user' : 'users'}
        </p>
        <UsersList
          currentUserId={currentUser?._id}
          onToggleStatus={handleToggleStatus}
          pendingId={pendingId}
          users={items}
        />
        <Pagination
          onPageChange={(nextPage) => updateParams({ page: nextPage > 1 ? String(nextPage) : '' })}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      </div>
    )
  }

  return (
    <section aria-label="Users">
      <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <Input
          label="Search users"
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Name or email"
          type="search"
          value={searchText}
        />
        <Select
          label="Role"
          onChange={(event) => updateParams({ role: event.target.value, page: '' })}
          value={role}
        >
          <option value="">All roles</option>
          <option value="student">Students</option>
          <option value="instructor">Instructors</option>
          <option value="admin">Admins</option>
        </Select>
      </div>
      {content}
    </section>
  )
}

export default UsersTab
