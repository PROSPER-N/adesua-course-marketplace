import { useCallback, useEffect, useState } from 'react'
import { BookOpen, Eye, FilePenLine, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { deleteCourse, updateCourseStatus } from '../../api/courses.js'
import { getMyCourses } from '../../api/instructor.js'
import InstructorStats from '../../components/instructor/InstructorStats.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorMessage from '../../components/ui/ErrorMessage.jsx'
import { formatMoney } from '../../utils/formatMoney.js'
import { getErrorMessage } from '../../utils/getErrorMessage.js'

// "published" -> "Published", "beginner" -> "Beginner".
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function InstructorDashboardPage() {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ attempt: -1, courses: [], error: null })
  const [busyId, setBusyId] = useState('')
  // A new key remounts the stats, so their counts load again after a course changes.
  const [statsKey, setStatsKey] = useState(0)
  const loading = result.attempt !== attempt

  const refresh = useCallback(() => {
    let active = true
    getMyCourses()
      .then((courses) => active && setResult({ attempt, courses, error: null }))
      .catch((error) => active && setResult({ attempt, courses: [], error }))
    return () => {
      active = false
    }
  }, [attempt])
  useEffect(refresh, [refresh])

  async function changeStatus(course) {
    const status = course.status === 'published' ? 'draft' : 'published'
    setBusyId(course._id)
    try {
      const updated = await updateCourseStatus(course._id, status)
      setResult((current) => ({
        ...current,
        courses: current.courses.map((item) =>
          item._id === course._id ? { ...item, ...updated } : item,
        ),
      }))
      setStatsKey((value) => value + 1)
      toast.success(status === 'published' ? 'Course published' : 'Course unpublished')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setBusyId('')
    }
  }

  async function removeCourse(course) {
    if (!window.confirm(`Delete “${course.title}”? This cannot be undone.`)) return
    setBusyId(course._id)
    try {
      await deleteCourse(course._id)
      setResult((current) => ({
        ...current,
        courses: current.courses.filter((item) => item._id !== course._id),
      }))
      setStatsKey((value) => value + 1)
      toast.success('Course deleted')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setBusyId('')
    }
  }

  const actionLinks = (course) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" to={`/instructor/courses/${course._id}/edit`} variant="outline">
        <FilePenLine aria-hidden="true" className="size-4" />
        Edit
      </Button>
      {course.status === 'published' && (
        <Button size="sm" to={`/courses/${course._id}`} variant="outline">
          <Eye aria-hidden="true" className="size-4" />
          View
        </Button>
      )}
      <Button
        disabled={busyId === course._id}
        loading={busyId === course._id}
        onClick={() => changeStatus(course)}
        size="sm"
        variant="ghost"
      >
        {course.status === 'published' ? 'Unpublish' : 'Publish'}
      </Button>
      <Button
        disabled={busyId === course._id || course.studentCount > 0}
        onClick={() => removeCourse(course)}
        size="sm"
        variant="danger"
      >
        <Trash2 aria-hidden="true" className="size-4" />
        Delete
      </Button>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl space-y-9 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Instructor</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">Your dashboard</h1>
          <p className="mt-2 text-muted">Manage your courses and track your teaching activity.</p>
        </div>
        <Button to="/instructor/courses/new">
          <Plus aria-hidden="true" className="size-5" />
          Create course
        </Button>
      </header>
      <InstructorStats key={statsKey} />
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-ink">Your courses</h2>
          {!loading && !result.error && (
            <span className="text-sm text-muted">{result.courses.length} total</span>
          )}
        </div>
        {loading && (
          <div aria-label="Loading courses" className="space-y-3" role="status">
            {[1, 2, 3].map((item) => (
              <div className="skeleton-shimmer h-20 rounded-xl" key={item} />
            ))}
          </div>
        )}
        {!loading && result.error && (
          <ErrorMessage
            message={getErrorMessage(result.error)}
            onRetry={() => setAttempt((value) => value + 1)}
            title="Couldn't load your courses"
          />
        )}
        {!loading && !result.error && result.courses.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            message="Create your first course and add lessons to get started."
            action={<Button to="/instructor/courses/new">Create a course</Button>}
          />
        )}
        {!loading && !result.error && result.courses.length > 0 && (
          <>
            <div className="hidden overflow-x-auto rounded-xl border border-line bg-white md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-surface text-muted">
                  <tr>
                    {['Course', 'Status', 'Price', 'Students', 'Lessons', 'Actions'].map(
                      (label) => (
                        <th className="px-4 py-3 font-semibold" key={label}>
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {result.courses.map((course) => (
                    <tr key={course._id}>
                      <td className="max-w-64 px-4 py-4">
                        <p className="truncate font-semibold text-ink">{course.title}</p>
                        <p className="mt-1 text-xs text-muted">
                          {course.category?.name ?? 'Uncategorized'} ·{' '}
                          {course.level ? capitalize(course.level) : 'Level not set'}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={course.status === 'published' ? 'green' : 'neutral'}>
                          {capitalize(course.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">{formatMoney(course.price)}</td>
                      <td className="px-4 py-4">{course.studentCount ?? 0}</td>
                      <td className="px-4 py-4">{course.lessonCount ?? 0}</td>
                      <td className="px-4 py-4">{actionLinks(course)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-4 md:hidden">
              {result.courses.map((course) => (
                <article className="rounded-xl border border-line bg-white p-4" key={course._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words font-semibold text-ink">{course.title}</h3>
                      <p className="mt-1 text-sm text-muted">
                        {course.category?.name ?? 'Uncategorized'} ·{' '}
                        {course.level ? capitalize(course.level) : 'Level not set'}
                      </p>
                    </div>
                    <Badge variant={course.status === 'published' ? 'green' : 'neutral'}>
                      {capitalize(course.status)}
                    </Badge>
                  </div>
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-muted">Price</dt>
                      <dd className="mt-1 font-semibold">{formatMoney(course.price)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Students</dt>
                      <dd className="mt-1 font-semibold">{course.studentCount ?? 0}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Lessons</dt>
                      <dd className="mt-1 font-semibold">{course.lessonCount ?? 0}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 border-t border-line pt-4">{actionLinks(course)}</div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default InstructorDashboardPage
