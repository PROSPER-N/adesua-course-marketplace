import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router'
import { enrollFree, getMyEnrollments } from '../../api/enrollments.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { getErrorMessage } from '../../utils/getErrorMessage.js'
import Button from '../ui/Button.jsx'

// course is the course from GET /api/courses/:id, with its lessons in order.
function EnrollButton({ course }) {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [enrolling, setEnrolling] = useState(false)

  // Only students have enrollments to check. The answer remembers the student and course it
  // belongs to, so the button keeps loading until the check for this pair is back.
  const courseId = course?._id
  const checkKey = user?.role === 'student' && courseId ? `${user._id}|${courseId}` : ''
  const [check, setCheck] = useState({ key: '', enrolled: false })
  const checking = Boolean(checkKey) && check.key !== checkKey

  useEffect(() => {
    if (!checkKey) return undefined

    let ignore = false
    getMyEnrollments()
      .then((enrollments) => {
        const enrolled = enrollments.some((enrollment) => enrollment.course?._id === courseId)
        if (!ignore) setCheck({ key: checkKey, enrolled })
      })
      .catch(() => {
        // Show the usual button. If they are enrolled after all, enrolling answers with a 409.
        if (!ignore) setCheck({ key: checkKey, enrolled: false })
      })

    return () => {
      ignore = true
    }
  }, [checkKey, courseId])

  // The course page can render this before its course has loaded.
  if (!course) return null

  const firstLesson = course.lessons?.[0]
  const firstLessonPath = firstLesson ? `/learn/${course._id}/${firstLesson._id}` : '/my-learning'
  const isFree = course.price === 0
  // The price is shown right next to the button, so the label doesn't repeat it.
  const label = isFree ? 'Enroll for free' : 'Buy now'

  async function handleEnroll() {
    setEnrolling(true)
    try {
      await enrollFree(course._id)
      // enrollFree returns only the enrollment, so this repeats the backend's own message.
      toast.success('Enrolled successfully')
      navigate(firstLessonPath)
    } catch (error) {
      toast.error(getErrorMessage(error))
      // Already enrolled, for example from another tab: offer the course instead.
      if (error.response?.status === 409) setCheck({ key: checkKey, enrolled: true })
      setEnrolling(false)
    }
  }

  if (authLoading || checking) {
    return <Button loading>{label}</Button>
  }

  if (!user) {
    // The login page sends people back to the page in "from" once they have logged in.
    return (
      <Button state={{ from: location }} to="/login">
        {label}
      </Button>
    )
  }

  if (user.role !== 'student') {
    return <p className="text-sm text-muted">Only student accounts can enroll.</p>
  }

  if (check.enrolled) {
    return <Button to={firstLessonPath}>Go to course</Button>
  }

  if (!isFree) {
    return <Button to={`/checkout/${course._id}`}>{label}</Button>
  }

  return (
    <Button loading={enrolling} loadingText="Enrolling…" onClick={handleEnroll}>
      {label}
    </Button>
  )
}

export default EnrollButton
