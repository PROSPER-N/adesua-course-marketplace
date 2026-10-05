import { Circle, CircleCheck } from 'lucide-react'
import { Link } from 'react-router'

// The course's lessons in order, with a tick on each finished one and the open lesson marked.
function LessonList({ courseId, lessons, currentLessonId, completedLessons }) {
  const done = new Set(completedLessons)

  return (
    <ol className="divide-y divide-line">
      {lessons.map((lesson, index) => {
        const finished = done.has(lesson._id)
        const current = lesson._id === currentLessonId
        const Icon = finished ? CircleCheck : Circle

        return (
          <li key={lesson._id}>
            <Link
              aria-current={current ? 'page' : undefined}
              className={`flex items-start gap-3 px-4 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand ${current ? 'bg-brand-soft' : 'hover:bg-surface'}`}
              to={`/learn/${courseId}/${lesson._id}`}
            >
              <Icon
                aria-hidden="true"
                className={`mt-0.5 size-5 shrink-0 ${finished ? 'text-brand' : 'text-muted/50'}`}
              />
              <span className="min-w-0 flex-1">
                <span className={`block ${current ? 'font-semibold text-brand-dark' : 'text-ink'}`}>
                  {index + 1}. {lesson.title}
                </span>
                <span className="text-muted">
                  {lesson.durationMinutes} min{finished ? ' · Completed' : ''}
                </span>
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

export default LessonList
