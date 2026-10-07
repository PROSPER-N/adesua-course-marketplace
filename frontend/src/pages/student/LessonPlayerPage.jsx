import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ExternalLink,
  Lock,
  SearchX,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router'
import { completeLesson } from '../../api/enrollments.js'
import { getCourseLessons } from '../../api/learning.js'
import LessonList from '../../components/learning/LessonList.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorMessage from '../../components/ui/ErrorMessage.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import SkeletonRow from '../../components/ui/SkeletonRow.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getErrorMessage } from '../../utils/getErrorMessage.js'
import { homePathForRole } from '../../utils/homePathForRole.js'
import { youtubeEmbedUrl } from '../../utils/youtubeEmbedUrl.js'

const BACK_LABELS = { student: 'My learning', instructor: 'Dashboard', admin: 'Admin' }

const lessonPath = (courseId, lesson) => `/learn/${courseId}/${lesson._id}`

// The lesson page has no site navbar, so this bar holds the way back and the course progress.
function PlayerHeader({ role, course, lessons, enrollment }) {
  const doneCount = enrollment ? countDone(lessons, enrollment.completedLessons) : 0

  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md text-sm font-semibold text-brand hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          to={homePathForRole(role)}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {BACK_LABELS[role] ?? 'Home'}
        </Link>
        {course && (
          <p className="min-w-0 flex-1 truncate font-display font-bold text-ink">{course.title}</p>
        )}
        {/* The course's instructor and admins can watch, but they aren't enrolled. */}
        {course && !enrollment && <Badge>Preview</Badge>}
      </div>
      {enrollment && (
        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:px-8">
          <div className="mb-1.5 flex justify-between gap-2 text-xs font-semibold text-muted">
            <span>
              {doneCount} of {lessons.length} lessons
            </span>
            <span>{enrollment.progress}%</span>
          </div>
          <ProgressBar label="Course progress" value={enrollment.progress} />
        </div>
      )}
    </header>
  )
}

// Counts only lessons still in the course, in case a finished one was deleted.
function countDone(lessons, completedLessons) {
  const done = new Set(completedLessons)
  return lessons.filter((lesson) => done.has(lesson._id)).length
}

function Video({ lesson }) {
  if (!lesson.videoUrl) return null

  const embedUrl = youtubeEmbedUrl(lesson.videoUrl)
  if (!embedUrl) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-xl bg-band p-6 text-center text-white">
        <p>This video can't be played here.</p>
        {/* Gold, as on the Home teach band, stands out on deep green in both themes. */}
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-gold px-4 font-semibold text-on-gold hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          href={lesson.videoUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Open the video
          <ExternalLink aria-hidden="true" className="size-4" />
        </a>
      </div>
    )
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-band">
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="size-full"
        referrerPolicy="strict-origin-when-cross-origin"
        src={embedUrl}
        title={lesson.title}
      />
    </div>
  )
}

function PlayerSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div>
        <div className="skeleton-shimmer aspect-video rounded-xl" />
        <div className="skeleton-shimmer mt-5 h-8 w-2/3 rounded" />
        <div className="skeleton-shimmer mt-3 h-4 w-1/4 rounded" />
      </div>
      <div className="hidden rounded-xl border border-line bg-card px-4 lg:block">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonRow columns={2} key={index} />
        ))}
      </div>
    </div>
  )
}

function LessonPlayerPage() {
  const { courseId, lessonId } = useParams()
  const { user } = useAuth()

  // Loaded once per course: moving between its lessons needs no new request.
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${courseId}|${attempt}`
  const [result, setResult] = useState({ key: '', data: null, error: null })
  const loading = result.key !== requestKey
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    let ignore = false
    getCourseLessons(courseId)
      .then((data) => {
        if (!ignore) setResult({ key: requestKey, data, error: null })
      })
      .catch((error) => {
        if (!ignore) setResult({ key: requestKey, data: null, error })
      })

    return () => {
      ignore = true
    }
  }, [courseId, requestKey])

  // A new lesson starts at the top, where its video is.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [lessonId])

  async function handleComplete() {
    setCompleting(true)
    try {
      const { completedLessons, progress } = await completeLesson(courseId, lessonId)
      setResult((current) => ({
        ...current,
        data: { ...current.data, enrollment: { completedLessons, progress } },
      }))
      // completeLesson returns only the progress, so this repeats the backend's own message.
      toast.success('Lesson marked as complete')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setCompleting(false)
    }
  }

  const status = result.error?.response?.status
  const data = loading || result.error ? null : result.data
  let body

  if (loading) {
    body = <PlayerSkeleton />
  } else if (status === 403) {
    body = (
      <EmptyState
        action={<Button to={`/courses/${courseId}`}>Go to the course</Button>}
        icon={Lock}
        message="Open the course page to enroll, then come back to start learning."
        title="Enroll in this course to watch its lessons"
      />
    )
  } else if (status === 404) {
    body = (
      <EmptyState
        action={<Button to="/courses">Browse courses</Button>}
        icon={SearchX}
        message="It may have been removed, or the link may be wrong."
        title="Course not found"
      />
    )
  } else if (result.error) {
    body = (
      <ErrorMessage
        message={getErrorMessage(result.error)}
        onRetry={() => setAttempt((current) => current + 1)}
        title="Couldn't load this lesson"
      />
    )
  } else {
    const { lessons, enrollment } = data
    const index = lessons.findIndex((lesson) => lesson._id === lessonId)

    if (index === -1) {
      body = (
        <EmptyState
          action={
            lessons.length > 0 && (
              <Button to={lessonPath(courseId, lessons[0])}>Go to the first lesson</Button>
            )
          }
          icon={SearchX}
          message="This lesson isn't part of the course."
          title="Lesson not found"
        />
      )
    } else {
      const lesson = lessons[index]
      const previous = lessons[index - 1]
      const next = lessons[index + 1]
      const completedLessons = enrollment?.completedLessons ?? []
      const isCompleted = completedLessons.includes(lesson._id)
      const listProps = { courseId, lessons, currentLessonId: lesson._id, completedLessons }
      const listSummary = enrollment
        ? `${countDone(lessons, completedLessons)} of ${lessons.length} done`
        : `${lessons.length} ${lessons.length === 1 ? 'lesson' : 'lessons'}`

      body = (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="min-w-0">
            <Video key={lesson._id} lesson={lesson} />

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand">
                  Lesson {index + 1} of {lessons.length}
                </p>
                <h1 className="mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
                  {lesson.title}
                </h1>
                <p className="mt-1 text-sm text-muted">{lesson.durationMinutes} min</p>
              </div>
              {enrollment && isCompleted && (
                <p className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-lg bg-brand-soft px-4 font-semibold text-brand-dark">
                  <CircleCheck aria-hidden="true" className="size-5" />
                  Completed
                </p>
              )}
              {enrollment && !isCompleted && (
                <Button
                  className="shrink-0 self-start"
                  loading={completing}
                  loadingText="Saving…"
                  onClick={handleComplete}
                >
                  <Check aria-hidden="true" className="size-5" />
                  Mark as complete
                </Button>
              )}
            </div>

            <nav aria-label="Lessons" className="mt-5 flex justify-between gap-3">
              <Button
                disabled={!previous}
                to={previous ? lessonPath(courseId, previous) : undefined}
                variant="outline"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
                Previous
              </Button>
              <Button
                disabled={!next}
                to={next ? lessonPath(courseId, next) : undefined}
                variant="outline"
              >
                Next
                <ChevronRight aria-hidden="true" className="size-4" />
              </Button>
            </nav>

            {/* Below lg the lesson list folds away here; from lg up it sits in the sidebar. */}
            <details className="mt-6 overflow-hidden rounded-xl border border-line bg-card lg:hidden">
              <summary className="cursor-pointer px-4 py-3 font-semibold text-ink">
                Course content <span className="font-normal text-muted">· {listSummary}</span>
              </summary>
              <div className="border-t border-line">
                <LessonList {...listProps} />
              </div>
            </details>

            <section className="mt-6 rounded-xl border border-line bg-card p-5 sm:p-6">
              <h2 className="font-display text-xl font-bold text-ink">Lesson notes</h2>
              {lesson.content ? (
                <p className="mt-3 leading-relaxed whitespace-pre-line text-ink">
                  {lesson.content}
                </p>
              ) : (
                <p className="mt-3 text-muted">This lesson has no notes.</p>
              )}
            </section>
          </div>

          <aside
            aria-label="Course content"
            className="hidden overflow-hidden rounded-xl border border-line bg-card lg:sticky lg:top-6 lg:block"
          >
            <div className="border-b border-line px-4 py-3">
              <h2 className="font-semibold text-ink">Course content</h2>
              <p className="text-sm text-muted">{listSummary}</p>
            </div>
            <LessonList {...listProps} />
          </aside>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <PlayerHeader
        course={data?.course}
        enrollment={data?.enrollment}
        lessons={data?.lessons ?? []}
        role={user?.role}
      />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{body}</div>
    </div>
  )
}

export default LessonPlayerPage
