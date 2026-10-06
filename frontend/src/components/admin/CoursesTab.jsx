import { SearchX } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router'
import { getAdminCourses } from '../../api/admin.js'
import { deleteCourse, updateCourseStatus } from '../../api/courses.js'
import { formatDate } from '../../utils/formatDate.js'
import { getErrorMessage } from '../../utils/getErrorMessage.js'
import { formatMoney } from '../../utils/formatMoney.js'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import ErrorMessage from '../ui/ErrorMessage.jsx'
import Input from '../ui/Input.jsx'
import Pagination from '../ui/Pagination.jsx'
import Select from '../ui/Select.jsx'
import SkeletonRow from '../ui/SkeletonRow.jsx'
import CourseCover from '../course/CourseCover.jsx'

const PAGE_SIZE = 10
const SEARCH_DELAY = 400
const STATUSES = ['published', 'draft']

function CourseIdentity({ course }) {
  return (
    <div className="flex min-w-56 items-center gap-3">
      <div className="w-24 shrink-0">
        <CourseCover
          category={course.category}
          thumbnailUrl={course.thumbnailUrl}
          title={course.title}
        />
      </div>
      <span className="font-semibold text-ink">{course.title}</span>
    </div>
  )
}

function CourseStatus({ status }) {
  return (
    <Badge variant={status === 'published' ? 'green' : 'neutral'}>
      {status === 'published' ? 'Published' : 'Draft'}
    </Badge>
  )
}

function CourseActions({ course, pendingAction, onUnpublish, onDelete }) {
  const pending = pendingAction?.courseId === course._id

  return (
    <div className="flex flex-wrap gap-2">
      {course.status === 'published' && (
        <Button
          disabled={pending && pendingAction.action !== 'unpublish'}
          loading={pending && pendingAction.action === 'unpublish'}
          loadingText="Unpublishing…"
          onClick={() => onUnpublish(course)}
          size="sm"
          variant="outline"
        >
          Unpublish
        </Button>
      )}
      {course.studentCount === 0 && (
        <Button
          disabled={pending && pendingAction.action !== 'delete'}
          loading={pending && pendingAction.action === 'delete'}
          loadingText="Deleting…"
          onClick={() => onDelete(course)}
          size="sm"
          variant="danger"
        >
          Delete
        </Button>
      )}
    </div>
  )
}

function CourseCards({ courses, actionProps }) {
  return (
    <ul className="grid gap-3 md:hidden">
      {courses.map((course) => (
        <li className="rounded-xl border border-line bg-white p-4" key={course._id}>
          <CourseIdentity course={course} />
          <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <div>
              <dt className="text-muted">Instructor</dt>
              <dd className="font-medium text-ink">{course.instructor?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted">Category</dt>
              <dd className="font-medium text-ink">{course.category?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted">Status</dt>
              <dd>
                <CourseStatus status={course.status} />
              </dd>
            </div>
            <div>
              <dt className="text-muted">Students</dt>
              <dd className="font-medium text-ink">{course.studentCount}</dd>
            </div>
            <div>
              <dt className="text-muted">Price</dt>
              <dd className="font-medium text-ink">{formatMoney(course.price)}</dd>
            </div>
            <div>
              <dt className="text-muted">Created</dt>
              <dd className="font-medium text-ink">{formatDate(course.createdAt)}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <CourseActions course={course} {...actionProps} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function CourseTable({ courses, actionProps }) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border border-line bg-white md:block">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-surface text-xs tracking-wide text-muted uppercase">
          <tr>
            {['Course', 'Instructor', 'Category', 'Status', 'Students', 'Price', 'Created'].map(
              (label) => (
                <th className="px-4 py-3 font-semibold" key={label} scope="col">
                  {label}
                </th>
              ),
            )}
            <th className="px-4 py-3 text-right font-semibold" scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {courses.map((course) => (
            <tr key={course._id}>
              <td className="px-4 py-3">
                <CourseIdentity course={course} />
              </td>
              <td className="px-4 py-3 text-muted">{course.instructor?.name ?? '—'}</td>
              <td className="px-4 py-3 text-muted">{course.category?.name ?? '—'}</td>
              <td className="px-4 py-3">
                <CourseStatus status={course.status} />
              </td>
              <td className="px-4 py-3 text-muted">{course.studentCount}</td>
              <td className="px-4 py-3 whitespace-nowrap text-muted">
                {formatMoney(course.price)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted">
                {formatDate(course.createdAt)}
              </td>
              <td className="px-4 py-3">
                <CourseActions course={course} {...actionProps} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CourseLoadingState() {
  return (
    <>
      <ul aria-hidden="true" className="grid gap-3 md:hidden">
        {Array.from({ length: 3 }, (_, index) => (
          <li className="skeleton-shimmer h-48 rounded-xl" key={index} />
        ))}
      </ul>
      <div
        aria-hidden="true"
        className="hidden rounded-xl border border-line bg-white px-4 md:block"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>
    </>
  )
}

function CoursesTab() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = (searchParams.get('search') ?? '').trim()
  const status = STATUSES.includes(searchParams.get('status')) ? searchParams.get('status') : ''
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1)
  const [searchText, setSearchText] = useState(search)
  const [pendingAction, setPendingAction] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: '', data: null, error: null })

  const requestKey = `${search}|${status}|${page}|${attempt}`
  const loading = result.key !== requestKey

  const updateParams = useCallback(
    (changes) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.set('tab', 'courses')
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

  useEffect(() => {
    const text = searchText.trim()
    if (text === search) return undefined

    const timer = setTimeout(() => updateParams({ search: text, page: '' }), SEARCH_DELAY)
    return () => clearTimeout(timer)
  }, [search, searchText, updateParams])

  useEffect(() => {
    let ignore = false

    getAdminCourses({
      search: search || undefined,
      status: status || undefined,
      page,
      limit: PAGE_SIZE,
    })
      .then((data) => {
        if (!ignore) setResult({ key: requestKey, data, error: null })
      })
      .catch((error) => {
        if (!ignore) setResult({ key: requestKey, data: null, error })
      })

    return () => {
      ignore = true
    }
  }, [page, requestKey, search, status])

  function clearFilters() {
    setSearchText('')
    setSearchParams({ tab: 'courses' }, { replace: true })
  }

  function updateCourseInList(courseId, changes) {
    setResult((current) => {
      if (!current.data) return current
      return {
        ...current,
        data: {
          ...current.data,
          items: current.data.items.map((course) =>
            course._id === courseId ? { ...course, ...changes } : course,
          ),
        },
      }
    })
  }

  async function handleUnpublish(course) {
    if (
      !window.confirm(
        `Unpublish "${course.title}"? It will no longer appear in the public course catalog.`,
      )
    ) {
      return
    }

    setPendingAction({ courseId: course._id, action: 'unpublish' })
    try {
      await updateCourseStatus(course._id, 'draft')
      updateCourseInList(course._id, { status: 'draft' })
      toast.success('Course unpublished')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setPendingAction(null)
    }
  }

  async function handleDelete(course) {
    if (!window.confirm(`Delete "${course.title}"? This action cannot be undone.`)) return

    setPendingAction({ courseId: course._id, action: 'delete' })
    try {
      await deleteCourse(course._id)
      setResult((current) => {
        if (!current.data) return current
        const items = current.data.items.filter((item) => item._id !== course._id)
        return {
          ...current,
          data: {
            ...current.data,
            items,
            pagination: {
              ...current.data.pagination,
              total: Math.max(0, current.data.pagination.total - 1),
              totalPages: Math.ceil(Math.max(0, current.data.pagination.total - 1) / PAGE_SIZE),
            },
          },
        }
      })
      toast.success('Course deleted')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setPendingAction(null)
    }
  }

  const filtered = Boolean(search || status)
  const actionProps = { pendingAction, onUnpublish: handleUnpublish, onDelete: handleDelete }
  let content

  if (loading) {
    content = <CourseLoadingState />
  } else if (result.error) {
    content = (
      <ErrorMessage
        message={getErrorMessage(result.error)}
        onRetry={() => setAttempt((current) => current + 1)}
        title="Couldn't load the courses"
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
            ? 'Try another title or status, or clear your filters to see every course.'
            : 'There are no courses to show on this page.'
        }
        title={filtered ? 'No courses match your filters' : 'No courses on this page'}
      />
    )
  } else {
    const { items, pagination } = result.data
    content = (
      <div className="grid gap-4">
        <p className="text-sm text-muted">
          {pagination.total} {pagination.total === 1 ? 'course' : 'courses'}
        </p>
        <CourseCards actionProps={actionProps} courses={items} />
        <CourseTable actionProps={actionProps} courses={items} />
        <Pagination
          onPageChange={(nextPage) => updateParams({ page: nextPage > 1 ? String(nextPage) : '' })}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      </div>
    )
  }

  return (
    <section aria-label="Courses">
      <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <Input
          label="Search courses"
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Course title"
          type="search"
          value={searchText}
        />
        <Select
          label="Status"
          onChange={(event) => updateParams({ status: event.target.value, page: '' })}
          value={status}
        >
          <option value="">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
      </div>
      {content}
    </section>
  )
}

export default CoursesTab
