import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { createCourse, deleteCourse, updateCourse, updateCourseStatus } from '../../api/courses.js'
import { getCategories } from '../../api/categories.js'
import { getMyCourse } from '../../api/instructor.js'
import { createLesson, deleteLesson, updateLesson } from '../../api/lessons.js'
import Button from '../../components/ui/Button.jsx'
import ErrorMessage from '../../components/ui/ErrorMessage.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Textarea from '../../components/ui/Textarea.jsx'
import { getErrorMessage, getFieldErrors } from '../../utils/getErrorMessage.js'

const EMPTY_COURSE = {
  title: '',
  shortDescription: '',
  description: '',
  category: '',
  level: 'beginner',
  price: '0',
  thumbnailUrl: '',
  whatYouWillLearn: ['', '', '', '', '', ''],
}
const EMPTY_LESSON = {
  title: '',
  videoUrl: '',
  content: '',
  durationMinutes: '10',
  isPreview: false,
}

function CourseFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [attempt, setAttempt] = useState(0)
  const loadKey = `${id ?? 'new'}:${attempt}`
  const [course, setCourse] = useState(EMPTY_COURSE)
  const [lessons, setLessons] = useState([])
  const [categories, setCategories] = useState([])
  const [loadResult, setLoadResult] = useState({ key: '', error: null })
  const loading = loadResult.key !== loadKey
  const loadError = loading ? null : loadResult.error
  const [fieldErrors, setFieldErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [lesson, setLesson] = useState(EMPTY_LESSON)
  const [lessonEditId, setLessonEditId] = useState('')
  const [lessonBusy, setLessonBusy] = useState(false)
  const [lessonError, setLessonError] = useState('')
  const [formError, setFormError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([getCategories(), editing ? getMyCourse(id) : Promise.resolve(null)])
      .then(([categoryList, courseData]) => {
        if (!active) return
        setCategories(categoryList)
        if (courseData) {
          setCourse({
            title: courseData.title ?? '',
            shortDescription: courseData.shortDescription ?? '',
            description: courseData.description ?? '',
            category: courseData.category?._id ?? courseData.category ?? '',
            level: courseData.level ?? 'beginner',
            price: String(courseData.price ?? 0),
            thumbnailUrl: courseData.thumbnailUrl ?? '',
            whatYouWillLearn: [
              ...(courseData.whatYouWillLearn ?? []),
              '',
              '',
              '',
              '',
              '',
              '',
            ].slice(0, 6),
          })
          setLessons(courseData.lessons ?? [])
        }
        setLoadResult({ key: loadKey, error: null })
      })
      .catch((error) => {
        if (active) setLoadResult({ key: loadKey, error })
      })
    return () => {
      active = false
    }
  }, [attempt, editing, id, loadKey])

  const checks = useMemo(() => {
    const rawPrice = course.price.trim()
    const priceIsNumeric = /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(rawPrice)
    const price = priceIsNumeric ? Number(rawPrice) : Number.NaN
    const priceValid = priceIsNumeric && Number.isFinite(price) && price >= 0 && price <= 5000
    return [
      {
        label: 'Title is valid (5–120 characters)',
        done: course.title.trim().length >= 5 && course.title.trim().length <= 120,
      },
      {
        label: 'Short description is provided (up to 160 characters)',
        done:
          course.shortDescription.trim().length > 0 && course.shortDescription.trim().length <= 160,
      },
      {
        label: 'Description has at least 20 characters',
        done: course.description.trim().length >= 20,
      },
      {
        label: 'A valid category is selected',
        done: categories.some((category) => category._id === course.category),
      },
      {
        label: 'A valid level is selected',
        done: ['beginner', 'intermediate', 'advanced'].includes(course.level),
      },
      { label: 'Price is a number from 0 to 5,000', done: priceValid },
      { label: 'At least one lesson is added', done: lessons.length > 0 },
    ]
  }, [categories, course, lessons.length])

  function updateField(event) {
    const { name, value } = event.target
    setCourse((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: '' }))
  }
  function updateOutcome(index, value) {
    setCourse((current) => ({
      ...current,
      whatYouWillLearn: current.whatYouWillLearn.map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    }))
  }
  function payload(price) {
    return {
      title: course.title.trim(),
      shortDescription: course.shortDescription.trim(),
      description: course.description.trim(),
      category: course.category,
      level: course.level,
      price,
      thumbnailUrl: course.thumbnailUrl.trim(),
      whatYouWillLearn: course.whatYouWillLearn.map((item) => item.trim()).filter(Boolean),
    }
  }

  async function saveCourse({ publish = false } = {}) {
    setFormError('')
    setFieldErrors({})
    setSaving(true)
    const rawPrice = course.price.trim()
    const priceIsNumeric = /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(rawPrice)
    if (rawPrice === '' || !priceIsNumeric) {
      setFieldErrors({ price: "Price can't be negative. Enter 0 for a free course." })
      setSaving(false)
      return
    }
    const price = Number(rawPrice)
    if (!Number.isFinite(price) || price < 0 || price > 5000) {
      const message =
        price < 0
          ? "Price can't be negative. Enter 0 for a free course."
          : "Price can't be more than 5,000."
      setFieldErrors({ price: message })
      setSaving(false)
      return
    }
    try {
      const saved = editing
        ? await updateCourse(id, payload(price))
        : await createCourse(payload(price))
      if (publish) await updateCourseStatus(saved._id ?? id, 'published')
      toast.success(publish ? 'Course published' : 'Course saved')
      if (!editing) navigate(`/instructor/courses/${saved._id}/edit`, { replace: true })
      else if (publish) navigate('/instructor')
    } catch (error) {
      setFormError(getErrorMessage(error))
      setFieldErrors(getFieldErrors(error))
    } finally {
      setSaving(false)
    }
  }

  async function saveLesson(event) {
    event.preventDefault()
    setLessonError('')
    setLessonBusy(true)
    const data = {
      title: lesson.title.trim(),
      videoUrl: lesson.videoUrl.trim(),
      content: lesson.content.trim(),
      durationMinutes: Number(lesson.durationMinutes),
      isPreview: lesson.isPreview,
    }
    try {
      if (lessonEditId) {
        const updated = await updateLesson(lessonEditId, data)
        setLessons((current) => current.map((item) => (item._id === lessonEditId ? updated : item)))
        toast.success('Lesson updated')
      } else {
        const created = await createLesson(id, data)
        setLessons((current) => [...current, created].sort((a, b) => a.order - b.order))
        toast.success('Lesson added')
      }
      setLesson(EMPTY_LESSON)
      setLessonEditId('')
    } catch (error) {
      setLessonError(getErrorMessage(error))
      setFieldErrors(getFieldErrors(error))
    } finally {
      setLessonBusy(false)
    }
  }

  async function removeLesson(item) {
    setLessonBusy(true)
    setLessonError('')
    try {
      await deleteLesson(item._id)
      setLessons((current) => current.filter((entry) => entry._id !== item._id))
      toast.success('Lesson deleted')
      if (lessonEditId === item._id) {
        setLessonEditId('')
        setLesson(EMPTY_LESSON)
      }
    } catch (error) {
      setLessonError(getErrorMessage(error))
    } finally {
      setLessonBusy(false)
    }
  }

  async function removeCourse() {
    if (!window.confirm('Delete this course and its lessons? This cannot be undone.')) return
    setDeleting(true)
    try {
      await deleteCourse(id)
      toast.success('Course deleted')
      navigate('/instructor')
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  if (loading)
    return (
      <div className="flex min-h-80 items-center justify-center" role="status">
        <Spinner className="size-7 text-brand" />
        <span className="sr-only">Loading course form</span>
      </div>
    )
  if (loadError)
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <ErrorMessage
          message={getErrorMessage(loadError)}
          onRetry={() => setAttempt((value) => value + 1)}
          title="Couldn't load course details"
        />
      </main>
    )

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
          to="/instructor"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Dashboard
        </Link>
        <h1 className="mt-4 font-display text-3xl font-extrabold text-ink">
          {editing ? 'Edit course' : 'Create a course'}
        </h1>
        <p className="mt-2 text-muted">
          Fill in the course details and build an ordered set of lessons.
        </p>
      </header>
      {formError && <ErrorMessage message={formError} title="Couldn't save course" />}
      <form
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          saveCourse()
        }}
      >
        <div className="min-w-0 space-y-6 rounded-2xl border border-line bg-white p-4 sm:p-6">
          <Input
            error={fieldErrors.title}
            label="Course title"
            maxLength={120}
            name="title"
            onChange={updateField}
            required
            value={course.title}
          />
          <Textarea
            error={fieldErrors.shortDescription}
            hint="Shown in course cards. Keep it to 160 characters or fewer."
            label="Short description"
            maxLength={160}
            name="shortDescription"
            onChange={updateField}
            required
            value={course.shortDescription}
          />
          <Textarea
            error={fieldErrors.description}
            label="Course description"
            name="description"
            onChange={updateField}
            required
            value={course.description}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              error={fieldErrors.category}
              label="Category"
              name="category"
              onChange={updateField}
              required
              value={course.category}
            >
              <option value="">Choose a category</option>
              {categories.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <Select
              error={fieldErrors.level}
              label="Level"
              name="level"
              onChange={updateField}
              value={course.level}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              error={fieldErrors.price}
              hint="Enter 0 for a free course; maximum 5,000."
              label="Price (₦)"
              max="5000"
              min="0"
              name="price"
              onChange={updateField}
              required
              type="number"
              value={course.price}
            />
            <Input
              error={fieldErrors.thumbnailUrl}
              hint="Optional full HTTPS image URL."
              label="Thumbnail URL"
              name="thumbnailUrl"
              onChange={updateField}
              type="url"
              value={course.thumbnailUrl}
            />
          </div>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold text-ink">
              What students will learn (up to 6)
            </legend>
            {course.whatYouWillLearn.map((outcome, index) => (
              <Input
                aria-label={`Learning outcome ${index + 1}`}
                key={index}
                maxLength={160}
                onChange={(event) => updateOutcome(index, event.target.value)}
                placeholder={`Learning outcome ${index + 1}`}
                value={outcome}
              />
            ))}
          </fieldset>
          <div className="flex flex-wrap gap-3 border-t border-line pt-5">
            <Button loading={saving} loadingText="Saving…" type="submit">
              <Save aria-hidden="true" className="size-4" />
              Save draft
            </Button>
            {editing && (
              <Button
                disabled={checks.some((item) => !item.done)}
                loading={saving}
                loadingText="Publishing…"
                onClick={() => saveCourse({ publish: true })}
                type="button"
                variant="gold"
              >
                Publish course
              </Button>
            )}
            {editing && (
              <Button
                disabled={deleting}
                loading={deleting}
                onClick={removeCourse}
                type="button"
                variant="danger"
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Delete course
              </Button>
            )}
          </div>
        </div>
        <aside className="h-fit rounded-2xl border border-line bg-white p-5">
          <h2 className="font-display text-lg font-bold text-ink">Publish checklist</h2>
          <ul className="mt-4 space-y-3">
            {checks.map((item) => (
              <li className="flex gap-2 text-sm" key={item.label}>
                <span
                  aria-hidden="true"
                  className={item.done ? 'font-bold text-brand' : 'text-muted'}
                >
                  {item.done ? '✓' : '○'}
                </span>
                <span className={item.done ? 'text-ink' : 'text-muted'}>{item.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-5 text-muted">
            The server requires at least one lesson before publishing. You can save a draft before
            completing the checklist.
          </p>
        </aside>
      </form>
      {editing && (
        <section className="space-y-5 rounded-2xl border border-line bg-white p-4 sm:p-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">Lessons</h2>
            <p className="mt-1 text-sm text-muted">
              Add notes or a YouTube link. Preview lessons are visible before enrollment.
            </p>
          </div>
          {lessons.length > 0 && (
            <ol className="divide-y divide-line rounded-xl border border-line">
              {lessons.map((item) => (
                <li
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                  key={item._id}
                >
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-ink">
                      {item.order}. {item.title}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {item.durationMinutes} min · {item.isPreview ? 'Preview' : 'Locked'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setLessonEditId(item._id)
                        setLesson({
                          title: item.title ?? '',
                          videoUrl: item.videoUrl ?? '',
                          content: item.content ?? '',
                          durationMinutes: String(item.durationMinutes ?? 10),
                          isPreview: Boolean(item.isPreview),
                        })
                        setLessonError('')
                      }}
                      size="sm"
                      variant="outline"
                    >
                      Edit
                    </Button>
                    <Button
                      disabled={
                        lessonBusy || (course.status === 'published' && lessons.length <= 1)
                      }
                      onClick={() => removeLesson(item)}
                      size="sm"
                      variant="danger"
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {lessonError && <ErrorMessage message={lessonError} title="Couldn't save lesson" />}
          <form className="grid gap-4 rounded-xl bg-surface p-4" noValidate onSubmit={saveLesson}>
            <h3 className="font-semibold text-ink">
              {lessonEditId ? 'Edit lesson' : 'Add a lesson'}
            </h3>
            <Input
              error={fieldErrors.title}
              label="Lesson title"
              maxLength={120}
              name="title"
              onChange={(event) =>
                setLesson((current) => ({ ...current, title: event.target.value }))
              }
              required
              value={lesson.title}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                error={fieldErrors.videoUrl}
                hint="Optional YouTube URL."
                label="YouTube URL"
                name="videoUrl"
                onChange={(event) =>
                  setLesson((current) => ({ ...current, videoUrl: event.target.value }))
                }
                type="url"
                value={lesson.videoUrl}
              />
              <Input
                error={fieldErrors.durationMinutes}
                label="Duration (minutes)"
                max="300"
                min="1"
                name="durationMinutes"
                onChange={(event) =>
                  setLesson((current) => ({ ...current, durationMinutes: event.target.value }))
                }
                required
                type="number"
                value={lesson.durationMinutes}
              />
            </div>
            <Textarea
              error={fieldErrors.content}
              hint="Lesson notes or written content."
              label="Lesson notes"
              name="content"
              onChange={(event) =>
                setLesson((current) => ({ ...current, content: event.target.value }))
              }
              value={lesson.content}
            />
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                checked={lesson.isPreview}
                onChange={(event) =>
                  setLesson((current) => ({ ...current, isPreview: event.target.checked }))
                }
                type="checkbox"
              />
              Allow this lesson as a free preview
            </label>
            <div className="flex flex-wrap gap-3">
              <Button loading={lessonBusy} loadingText="Saving lesson…" type="submit">
                <Plus aria-hidden="true" className="size-4" />
                {lessonEditId ? 'Save lesson' : 'Add lesson'}
              </Button>
              {lessonEditId && (
                <Button
                  onClick={() => {
                    setLessonEditId('')
                    setLesson(EMPTY_LESSON)
                    setLessonError('')
                  }}
                  type="button"
                  variant="ghost"
                >
                  Cancel edit
                </Button>
              )}
            </div>
          </form>
        </section>
      )}
    </main>
  )
}

export default CourseFormPage
