import { SearchX } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { getCategories } from '../../api/categories.js'
import { getCourses } from '../../api/courses.js'
import CourseCard from '../../components/course/CourseCard.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorMessage from '../../components/ui/ErrorMessage.jsx'
import Input from '../../components/ui/Input.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import Select from '../../components/ui/Select.jsx'
import SkeletonCard from '../../components/ui/SkeletonCard.jsx'
import { useReveal } from '../../hooks/useReveal.js'
import { getErrorMessage } from '../../utils/getErrorMessage.js'

const PAGE_SIZE = 9
const SEARCH_DELAY = 400
const LEVELS = ['beginner', 'intermediate', 'advanced']
const PRICES = ['free', 'paid']
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
]

function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Cleaned before use, because the API answers 400 to a filter or page it doesn't accept.
  const search = (searchParams.get('search') ?? '').trim()
  const category = searchParams.get('category') ?? ''
  const level = LEVELS.includes(searchParams.get('level')) ? searchParams.get('level') : ''
  const price = PRICES.includes(searchParams.get('price')) ? searchParams.get('price') : ''
  const sort = SORTS.some((option) => option.value === searchParams.get('sort'))
    ? searchParams.get('sort')
    : 'newest'
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1)

  // The search box follows the URL, so Back, Clear filters and the navbar's "Browse courses"
  // empty it. It's adjusted while rendering, not in an effect, so it never shows old text.
  const [searchText, setSearchText] = useState(search)
  const [syncedSearch, setSyncedSearch] = useState(search)
  if (search !== syncedSearch) {
    setSyncedSearch(search)
    // Leaves a trailing space alone while the person is still typing.
    if (searchText.trim() !== search) setSearchText(search)
  }

  const [categories, setCategories] = useState([])
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: '', data: null, error: null })

  // A result remembers the request it answers, so the list loads until the latest request has one.
  const requestKey = `${search}|${category}|${level}|${price}|${sort}|${page}|${attempt}`
  const loading = result.key !== requestKey

  // Each new set of results fades in as it scrolls into view.
  const listRef = useRef(null)
  useReveal(listRef, { dependencies: [result] })

  // Each change adds a history entry, so Back undoes it. Changing anything but the page
  // starts again from page 1.
  const updateParams = useCallback(
    (changes) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        for (const [name, value] of Object.entries(changes)) {
          if (value) next.set(name, value)
          else next.delete(name)
        }
        if (!('page' in changes)) next.delete('page')
        return next
      })
    },
    [setSearchParams],
  )

  // Search once typing has stopped for a moment.
  useEffect(() => {
    const text = searchText.trim()
    if (text === search) return undefined

    const timer = setTimeout(() => updateParams({ search: text }), SEARCH_DELAY)
    return () => clearTimeout(timer)
  }, [search, searchText, updateParams])

  useEffect(() => {
    let ignore = false
    getCategories()
      .then((list) => {
        if (!ignore) setCategories(list)
      })
      // Without the list, the category filter still shows "All categories".
      .catch(() => {})

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false
    getCourses({
      search: search || undefined,
      category: category || undefined,
      level: level || undefined,
      price: price || undefined,
      sort,
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
  }, [category, level, page, price, requestKey, search, sort])

  function clearFilters() {
    setSearchText('')
    setSearchParams({})
  }

  const hasFilters = Boolean(search || category || level || price)

  let content
  if (loading) {
    content = (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonCard course key={index} />
        ))}
      </div>
    )
  } else if (result.error) {
    content = (
      <ErrorMessage
        message={getErrorMessage(result.error)}
        onRetry={() => setAttempt((current) => current + 1)}
        title="Couldn't load the courses"
      />
    )
  } else if (result.data.items.length === 0) {
    let message = 'Published courses will appear here.'
    if (hasFilters) message = 'Try another word or filter, or clear them to see every course.'
    else if (page > 1) message = 'This page is past the end of the list.'

    content = (
      <EmptyState
        action={
          hasFilters || page > 1 ? (
            <Button onClick={clearFilters} variant="outline">
              Clear filters
            </Button>
          ) : null
        }
        icon={SearchX}
        message={message}
        title={search ? `No courses match "${search}"` : 'No courses found'}
      />
    )
  } else {
    const { items, pagination } = result.data
    content = (
      <div className="grid gap-6">
        <p className="text-sm text-muted">
          {pagination.total} {pagination.total === 1 ? 'course' : 'courses'}
        </p>
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" ref={listRef}>
          {items.map((course) => (
            <li data-reveal="" key={course._id}>
              <CourseCard course={course} />
            </li>
          ))}
        </ul>
        <Pagination
          onPageChange={(nextPage) => updateParams({ page: nextPage > 1 ? String(nextPage) : '' })}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <p className="text-xs font-semibold tracking-[0.12em] text-brand uppercase">Learn</p>
        <h1 className="mt-2 font-serif text-display font-medium text-ink">Browse courses</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Find practical courses to build useful skills at your own pace.
        </p>
      </header>

      <div className="mt-8 grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
        <Input
          aria-label="Search courses"
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search courses"
          type="search"
          value={searchText}
        />
        <Select
          label="Sort by"
          onChange={(event) => updateParams({ sort: event.target.value })}
          value={sort}
        >
          {SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside aria-label="Filters" className="grid content-start gap-5">
          <Select
            label="Category"
            onChange={(event) => updateParams({ category: event.target.value })}
            value={category}
          >
            <option value="">All categories</option>
            {categories.map((option) => (
              <option key={option._id} value={option.slug}>
                {option.name}
              </option>
            ))}
          </Select>

          <Select
            label="Level"
            onChange={(event) => updateParams({ level: event.target.value })}
            value={level}
          >
            <option value="">All levels</option>
            {LEVELS.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </Select>

          <Select
            label="Price"
            onChange={(event) => updateParams({ price: event.target.value })}
            value={price}
          >
            <option value="">Any price</option>
            {PRICES.map((option) => (
              <option key={option} value={option}>
                {option === 'free' ? 'Free' : 'Paid'}
              </option>
            ))}
          </Select>

          {hasFilters && (
            <Button className="justify-self-start" onClick={clearFilters} size="sm" variant="ghost">
              Clear filters
            </Button>
          )}
        </aside>

        <section aria-label="Courses">{content}</section>
      </div>
    </div>
  )
}

export default CoursesPage
