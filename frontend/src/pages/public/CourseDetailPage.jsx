import { BookOpen, Clock3, GraduationCap, LockKeyhole, PlayCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getCourse } from '../../api/courses.js'
import EnrollButton from '../../components/course/EnrollButton.jsx'
import Badge from '../../components/ui/Badge.jsx'
import ErrorMessage from '../../components/ui/ErrorMessage.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { formatMoney } from '../../utils/formatMoney.js'
import { getErrorMessage } from '../../utils/getErrorMessage.js'

function CourseDetailPage() {
  const { id } = useParams()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: '', course: null, error: null })
  const key = `${id}:${attempt}`
  const loading = result.key !== key

  const loadCourse = useCallback(() => {
    let active = true
    getCourse(id)
      .then((course) => active && setResult({ key, course, error: null }))
      .catch((error) => active && setResult({ key, course: null, error }))
    return () => {
      active = false
    }
  }, [id, key])

  useEffect(loadCourse, [loadCourse])

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center" role="status">
        <Spinner className="size-7 text-brand" />
        <span className="sr-only">Loading course</span>
      </div>
    )
  }

  if (result.error) {
    const notFound = result.error.response?.status === 404
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <ErrorMessage
          message={
            notFound
              ? 'This course may have been removed or is no longer available.'
              : getErrorMessage(result.error)
          }
          onRetry={notFound ? undefined : () => setAttempt((value) => value + 1)}
          title={notFound ? 'Course not found' : "Couldn't load this course"}
        />
      </div>
    )
  }

  const course = result.course
  const lessons = course.lessons ?? []
  const hours = Math.floor((course.totalMinutes ?? 0) / 60)
  const minutes = (course.totalMinutes ?? 0) % 60
  const duration =
    [hours ? `${hours} hr${hours === 1 ? '' : 's'}` : '', minutes ? `${minutes} min` : '']
      .filter(Boolean)
      .join(' ') || '0 min'
  const level = course.level ? course.level[0].toUpperCase() + course.level.slice(1) : 'All levels'

  return (
    <div className="pb-24 lg:pb-12">
      <header className="bg-brand-dark text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div>
            <Link className="text-sm font-semibold text-white/80 hover:text-white" to="/courses">
              ← Back to courses
            </Link>
            <p className="mt-6 text-sm text-white/75">{course.category?.name ?? 'Course'}</p>
            <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl">
              {course.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/85 sm:text-lg">
              {course.shortDescription}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-white/85">
              <span>By {course.instructor?.name ?? 'Instructor'}</span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen aria-hidden="true" className="size-4" />
                {course.lessonCount ?? lessons.length} lessons
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 aria-hidden="true" className="size-4" />
                {duration}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap aria-hidden="true" className="size-4" />
                {(course.studentCount ?? 0).toLocaleString()} students
              </span>
              <Badge variant="gold">{level}</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-9 sm:px-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:px-8">
        <div className="min-w-0 space-y-10">
          {course.whatYouWillLearn?.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold text-ink">What you’ll learn</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {course.whatYouWillLearn.map((item, index) => (
                  <li
                    className="flex gap-3 rounded-xl bg-brand-soft/50 p-4 text-sm text-ink"
                    key={`${item}-${index}`}
                  >
                    <span aria-hidden="true" className="font-bold text-brand">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2 className="font-display text-2xl font-bold text-ink">Course lessons</h2>
            <ol className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
              {lessons.map((lesson, index) => (
                <li
                  className="flex items-start justify-between gap-4 px-4 py-4 sm:px-5"
                  key={lesson._id}
                >
                  <div className="flex min-w-0 gap-3">
                    <span className="pt-0.5 text-sm font-semibold text-muted">{index + 1}.</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{lesson.title}</p>
                      <p className="mt-1 text-sm text-muted">{lesson.durationMinutes} min</p>
                      {lesson.isPreview && lesson.content && (
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">
                          {lesson.content}
                        </p>
                      )}
                      {lesson.isPreview && lesson.videoUrl && (
                        <a
                          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                          href={lesson.videoUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Watch preview <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 pt-0.5 text-xs font-semibold text-brand">
                    {lesson.isPreview ? (
                      <>
                        <PlayCircle aria-hidden="true" className="size-4" />
                        Preview
                      </>
                    ) : (
                      <>
                        <LockKeyhole aria-hidden="true" className="size-4" />
                        Enroll to unlock
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <section>
            <h2 className="font-display text-2xl font-bold text-ink">About this course</h2>
            <p className="mt-4 whitespace-pre-line leading-7 text-muted">{course.description}</p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-bold text-ink">Your instructor</h2>
            <div className="mt-4 rounded-xl border border-line bg-white p-5">
              <p className="font-semibold text-ink">{course.instructor?.name ?? 'Instructor'}</p>
              {course.instructor?.bio && (
                <p className="mt-2 whitespace-pre-line leading-7 text-muted">
                  {course.instructor.bio}
                </p>
              )}
            </div>
          </section>
        </div>
        <aside className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:sticky lg:top-24 lg:inset-x-auto lg:bottom-auto lg:z-auto lg:h-fit lg:rounded-2xl lg:border lg:border-line lg:p-5 lg:shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 lg:block">
            <p className="shrink-0 font-display text-xl font-bold text-ink lg:text-3xl">
              {formatMoney(course.price)}
            </p>
            <div className="lg:mt-4">
              <EnrollButton course={course} />
            </div>
          </div>
          <p className="hidden text-sm text-muted lg:mt-4 lg:block">
            {course.lessonCount ?? lessons.length} lessons · {duration}
          </p>
        </aside>
      </div>
    </div>
  )
}

export default CourseDetailPage
