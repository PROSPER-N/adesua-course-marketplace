import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { getCourseLessons } from '../../api/learning.js'
import { getErrorMessage } from '../../utils/getErrorMessage.js'
import CourseCover from '../course/CourseCover.jsx'
import Button from '../ui/Button.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'

// One enrolled course in My learning. Continue opens the first lesson that isn't done yet,
// and Review (for a finished course) opens the first lesson.
function LearningCourseCard({ enrollment }) {
  const { course, completedLessons, progress } = enrollment
  const navigate = useNavigate()
  const [opening, setOpening] = useState(false)
  const finished = progress >= 100
  // A deleted lesson can stay in completedLessons, so never show more done than there are.
  const doneCount = Math.min(completedLessons.length, course.lessonCount)

  async function handleOpen() {
    setOpening(true)
    try {
      // My enrollments has no lesson list, so ask for it to find where to pick up.
      const { lessons } = await getCourseLessons(course._id)
      const done = new Set(completedLessons)
      const lesson = (finished ? null : lessons.find((item) => !done.has(item._id))) ?? lessons[0]
      if (!lesson) {
        toast.error("This course doesn't have any lessons yet.")
        setOpening(false)
        return
      }
      navigate(`/learn/${course._id}/${lesson._id}`)
    } catch (error) {
      toast.error(getErrorMessage(error))
      setOpening(false)
    }
  }

  return (
    <article className="flex h-full flex-col rounded-xl border border-line bg-white p-3">
      <CourseCover
        category={course.category}
        thumbnailUrl={course.thumbnailUrl}
        title={course.title}
      />
      <div className="flex flex-1 flex-col px-1 pt-4 pb-1">
        <h3 className="font-display text-lg font-bold leading-snug text-ink">{course.title}</h3>
        {course.instructor?.name && (
          <p className="mt-1 text-sm text-muted">By {course.instructor.name}</p>
        )}
        <div className="mt-auto pt-4">
          <div className="mb-1.5 flex justify-between gap-2 text-sm">
            <span className="text-muted">
              {doneCount} of {course.lessonCount} lessons
            </span>
            <span className="font-semibold text-ink">{progress}%</span>
          </div>
          <ProgressBar label={`${course.title} progress`} value={progress} />
          <Button
            className="mt-4"
            fullWidth
            loading={opening}
            loadingText="Opening…"
            onClick={handleOpen}
            variant={finished ? 'outline' : 'primary'}
          >
            {finished ? 'Review' : 'Continue'}
            <span className="sr-only"> {course.title}</span>
          </Button>
        </div>
      </div>
    </article>
  )
}

export default LearningCourseCard
