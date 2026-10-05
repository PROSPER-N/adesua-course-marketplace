import { BookOpen, GraduationCap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { getMyEnrollments } from '../../api/enrollments.js'
import LearningCourseCard from '../../components/learning/LearningCourseCard.jsx'
import PurchaseHistory from '../../components/learning/PurchaseHistory.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorMessage from '../../components/ui/ErrorMessage.jsx'
import SkeletonCard from '../../components/ui/SkeletonCard.jsx'
import { getErrorMessage } from '../../utils/getErrorMessage.js'

const TABS = [
  { id: 'in-progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
]

const browseButton = <Button to="/courses">Browse courses</Button>

function MyLearningPage() {
  const [searchParams] = useSearchParams()
  // The tab lives in the URL, so a refresh or the Back button keeps it.
  const tab = searchParams.get('tab') === 'completed' ? 'completed' : 'in-progress'

  // A result remembers the attempt it answers, so the cards load until the latest attempt has one.
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ attempt: -1, enrollments: null, error: null })
  const loading = result.attempt !== attempt

  useEffect(() => {
    let ignore = false
    getMyEnrollments()
      .then((enrollments) => {
        if (!ignore) setResult({ attempt, enrollments, error: null })
      })
      .catch((error) => {
        if (!ignore) setResult({ attempt, enrollments: null, error })
      })

    return () => {
      ignore = true
    }
  }, [attempt])

  let content
  if (loading) {
    content = (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    )
  } else if (result.error) {
    content = (
      <ErrorMessage
        message={getErrorMessage(result.error)}
        onRetry={() => setAttempt((current) => current + 1)}
        title="Couldn't load your courses"
      />
    )
  } else if (result.enrollments.length === 0) {
    content = (
      <EmptyState
        action={browseButton}
        icon={BookOpen}
        message="Find a course you like, enroll, and it will appear here with your progress."
        title="You haven't enrolled in any courses yet"
      />
    )
  } else {
    const groups = {
      'in-progress': result.enrollments.filter((enrollment) => enrollment.progress < 100),
      completed: result.enrollments.filter((enrollment) => enrollment.progress >= 100),
    }
    const shown = groups[tab]

    content = (
      <>
        <nav aria-label="Course progress" className="flex gap-6 border-b border-line">
          {TABS.map(({ id, label }) => {
            const active = tab === id
            return (
              <Link
                aria-current={active ? 'page' : undefined}
                className={`-mb-px rounded-t-md border-b-2 px-1 pb-3 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${active ? 'border-brand text-brand-dark' : 'border-transparent text-muted hover:text-ink'}`}
                key={id}
                to={`?tab=${id}`}
              >
                {label} ({groups[id].length})
              </Link>
            )
          })}
        </nav>

        <div className="mt-6">
          {shown.length === 0 && tab === 'completed' && (
            <EmptyState
              icon={GraduationCap}
              message="Finish every lesson in a course and it moves here."
              title="No completed courses yet"
            />
          )}
          {shown.length === 0 && tab === 'in-progress' && (
            <EmptyState
              action={browseButton}
              icon={GraduationCap}
              message="You've finished every course you started. Find your next one."
              title="Nothing in progress"
            />
          )}
          {shown.length > 0 && (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((enrollment) => (
                <li key={enrollment._id}>
                  <LearningCourseCard enrollment={enrollment} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">My learning</h1>
        <p className="mt-2 text-muted">Your courses, your progress and your purchases.</p>
      </header>

      <section aria-labelledby="my-courses-heading" className="mt-8">
        <h2 className="sr-only" id="my-courses-heading">
          Your courses
        </h2>
        {content}
      </section>

      <div className="mt-12">
        <PurchaseHistory />
      </div>
    </div>
  )
}

export default MyLearningPage
