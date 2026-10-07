import { useEffect, useMemo, useRef, useState } from 'react'
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
import { makeCourseSummary } from '../../utils/courseSummary.js'
import { getErrorMessage, getFieldErrors } from '../../utils/getErrorMessage.js'

const EMPTY_COURSE = {
  title: '',
  description: '',
  category: '',
  level: 'beginner',
  price: '0',
  thumbnailUrl: '',
  whatYouWillLearn: ['', '', '', '', '', ''],
  status: 'draft',
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
  const [savedCourseId, setSavedCourseId] = useState('')
  const createdCourseRef = useRef(false)
  // The description and summary as last saved.
  const lastSavedRef = useRef({ description: '', shortDescription: '' })
  const courseId = id || savedCourseId
  const editing = Boolean(courseId)
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
  const [changingStatus, setChangingStatus] = useState(false)
  const [lesson, setLesson] = useState(EMPTY_LESSON)
  const [lessonEditId, setLessonEditId] = useState('')
  const [lessonBusy, setLessonBusy] = useState(false)
  const [lessonError, setLessonError] = useState('')
  // Separate from fieldErrors, because a course and a lesson both have a "title" field.
  const [lessonFieldErrors, setLessonFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (createdCourseRef.current) {
      setLoadResult({ key: loadKey, error: null })
      return undefined
    }

    let active = true
    Promise.all([getCategories(), editing ? getMyCourse(id) : Promise.resolve(null)])
      .then(([categoryList, courseData]) => {
        if (!active) return
        setCategories(categoryList)
        if (courseData) {
          setCourse({
            title: courseData.title ?? '',
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
            status: courseData.status ?? 'draft',
          })
          lastSavedRef.current = {
            description: courseData.description ?? '',
            shortDescription: courseData.shortDescription ?? '',
          }
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
  // An existing course keeps its saved summary, which may be hand-written,
  // until its description changes.
  function summaryFor(description) {
    const saved = lastSavedRef.current
    if (saved.shortDescription && description.trim() === saved.description.trim()) {
      return saved.shortDescription
    }
    return makeCourseSummary(description)
  }
  function payload(price) {
    return {
      title: course.title.trim(),
      shortDescription: summaryFor(course.description),
      description: course.description.trim(),
      category: course.category,
      level: course.level,
      price,
      thumbnailUrl: course.thumbnailUrl.trim(),
      whatYouWillLearn: course.whatYouWillLearn.map((item) => item.trim()).filter(Boolean),
    }
  }

  function getValidatedPayload() {
    const rawPrice = course.price.trim()
    const priceIsNumeric = /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(rawPrice)
    if (rawPrice === '' || !priceIsNumeric) {
      setFieldErrors({ price: "Price can't be negative. Enter 0 for a free course." })
      return null
    }
    const price = Number(rawPrice)
    if (!Number.isFinite(price) || price < 0 || price > 5000) {
      setFieldErrors({
        price:
          price < 0
            ? "Price can't be negative. Enter 0 for a free course."
            : "Price can't be more than 5,000.",
      })
      return null
    }
    return payload(price)
  }

  async function ensureCourseSaved() {
    if (courseId) return courseId

    setFormError('')
    setFieldErrors({})
    const data = getValidatedPayload()
    if (!data) return ''

    setSaving(true)
    try {
      const saved = await createCourse(data)
      lastSavedRef.current = {
        description: data.description,
        shortDescription: data.shortDescription,
      }
      createdCourseRef.current = true
      setSavedCourseId(saved._id)
      navigate(`/instructor/courses/${saved._id}/edit`, { replace: true })
      return saved._id
    } catch (error) {
      setFormError(getErrorMessage(error))
      setFieldErrors(getFieldErrors(error))
      return ''
    } finally {
      setSaving(false)
    }
  }

  async function saveCourse({ publish = false } = {}) {
    // Save and Publish each show their own loading state.
    const setBusy = publish ? setChangingStatus : setSaving
    setFormError('')
    setFieldErrors({})
    setBusy(true)
    const data = getValidatedPayload()
    if (!data) {
      setBusy(false)
      return
    }
    try {
      const saved = editing ? await updateCourse(courseId, data) : await createCourse(data)
      lastSavedRef.current = {
        description: data.description,
        shortDescription: data.shortDescription,
      }
      if (!editing) {
        createdCourseRef.current = true
        setSavedCourseId(saved._id)
      }
      if (publish) await updateCourseStatus(saved._id ?? courseId, 'published')
      toast.success(publish ? 'Course published' : 'Course saved')
      if (!editing) navigate(`/instructor/courses/${saved._id}/edit`, { replace: true })
      else if (publish) navigate('/instructor')
    } catch (error) {
      setFormError(getErrorMessage(error))
      setFieldErrors(getFieldErrors(error))
    } finally {
      setBusy(false)
    }
  }

  async function unpublishCourse() {
    setFormError('')
    setChangingStatus(true)
    try {
      await updateCourseStatus(courseId, 'draft')
      setCourse((current) => ({ ...current, status: 'draft' }))
      toast.success('Course unpublished')
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setChangingStatus(false)
    }
  }

  async function saveLesson(event) {
    event.preventDefault()
    setLessonError('')
    setLessonFieldErrors({})
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
        const targetCourseId = await ensureCourseSaved()
        if (!targetCourseId) return
        const created = await createLesson(targetCourseId, data)
        setLessons((current) => [...current, created].sort((a, b) => a.order - b.order))
        toast.success('Lesson added')
      }
      setLesson(EMPTY_LESSON)
      setLessonEditId('')
    } catch (error) {
      setLessonError(getErrorMessage(error))
      setLessonFieldErrors(getFieldErrors(error))
    } finally {
      setLessonBusy(false)
    }
  }

  async function removeLesson(item) {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return
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
      await deleteCourse(courseId)
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
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <ErrorMessage
          message={getErrorMessage(loadError)}
          onRetry={() => setAttempt((value) => value + 1)}
          title="Couldn't load course details"
        />
      </div>
    )

  const published = course.status === 'published'

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
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
            error={fieldErrors.description}
            hint="The opening becomes the course summary (up to 160 characters)."
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
              label="Price (USD)"
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
            The server requires at least one lesson before publishing. Add lessons here, then
            publish when the checklist is complete.
          </p>
        </aside>
      </form>
      <section className="space-y-5 rounded-2xl border border-line bg-white p-4 sm:p-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Lessons</h2>
          <p className="mt-1 text-sm text-muted">
            Adding your first lesson saves the course as a draft. Add notes or a YouTube link;
            preview lessons are visible before enrollment.
          </p>
        </div>
        {lessons.length > 0 && (
          <ol className="divide-y divide-line rounded-xl border border-line">
            {lessons.map((item) => (
              <li className="flex flex-wrap items-center justify-between gap-3 p-4" key={item._id}>
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
                      setLessonFieldErrors({})
                    }}
                    size="sm"
                    variant="outline"
                  >
                    Edit
                  </Button>
                  <Button
                    disabled={lessonBusy || (course.status === 'published' && lessons.length <= 1)}
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
            error={lessonFieldErrors.title}
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
              error={lessonFieldErrors.videoUrl}
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
              error={lessonFieldErrors.durationMinutes}
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
            error={lessonFieldErrors.content}
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
                  setLessonFieldErrors({})
                }}
                type="button"
                variant="ghost"
              >
                Cancel edit
              </Button>
            )}
          </div>
        </form>
        <div className="flex flex-wrap gap-3 border-t border-line pt-5">
          <Button
            disabled={changingStatus}
            loading={saving}
            loadingText="Saving…"
            onClick={() => saveCourse()}
            type="button"
          >
            <Save aria-hidden="true" className="size-4" />
            {published ? 'Save changes' : 'Save draft'}
          </Button>
          {editing && published && (
            <Button
              disabled={saving}
              loading={changingStatus}
              loadingText="Unpublishing…"
              onClick={unpublishCourse}
              type="button"
              variant="outline"
            >
              Unpublish
            </Button>
          )}
          {editing && !published && (
            <Button
              disabled={saving || checks.some((item) => !item.done)}
              loading={changingStatus}
              loadingText="Publishing…"
              onClick={() => saveCourse({ publish: true })}
              type="button"
              variant="gold"
            >
              Publish
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
      </section>
    </div>
  )
}

export default CourseFormPage
