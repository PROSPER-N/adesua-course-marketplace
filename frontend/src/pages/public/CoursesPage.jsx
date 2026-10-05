import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { getCourses } from '../../api/courses.js'
import { getCategories } from '../../api/categories.js'
import CourseCard from '../../components/course/CourseCard.jsx'
import ErrorMessage from '../../components/ui/ErrorMessage.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import SkeletonCard from '../../components/ui/SkeletonCard.jsx'
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
  const courses = result.data?.items ?? []
  const pagination = result.data?.pagination

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">Learn</p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">Browse courses</h1>

        <p className="mt-2 max-w-2xl text-gray-600">
          Find practical courses to build useful skills at your own pace.
        </p>
      </header>

      <section className="mb-8 grid gap-3 md:grid-cols-[1fr_220px]">
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search courses..."
          className="h-11 rounded-lg border border-gray-300 px-4 outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
        />

        <select
          value={sort}
          onChange={(event) => updateParams({ sort: event.target.value })}
          className="h-11 rounded-lg border border-gray-300 px-3"
        >
          {SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </section>

      <section className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">Category</label>

            <select
              value={category}
              onChange={(event) => updateParams({ category: event.target.value })}
              className="h-10 w-full rounded-lg border border-gray-300 px-3"
            >
              <option value="">All categories</option>

              {categories.map((option) => (
                <option key={option._id} value={option.slug}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">Level</label>

            <select
              value={level}
              onChange={(event) => updateParams({ level: event.target.value })}
              className="h-10 w-full rounded-lg border border-gray-300 px-3"
            >
              <option value="">All levels</option>

              {LEVELS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">Price</label>

            <select
              value={price}
              onChange={(event) => updateParams({ price: event.target.value })}
              className="h-10 w-full rounded-lg border border-gray-300 px-3"
            >
              <option value="">Any price</option>

              {PRICES.map((option) => (
                <option key={option} value={option}>
                  {option === 'free' ? 'Free' : 'Paid'}
                </option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-green-700 hover:underline"
            >
              Clear filters
            </button>
          )}
        </aside>

        <div>
          {!loading && !result.error && pagination && (
            <p className="mb-4 text-sm text-gray-500">
              {pagination.total} {pagination.total === 1 ? 'course' : 'courses'}
            </p>
          )}

          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          )}

          {!loading && result.error && (
            <ErrorMessage
              message={getErrorMessage(result.error)}
              onRetry={() => setAttempt((current) => current + 1)}
              title="Couldn't load the courses"
            />
          )}

          {!loading && !result.error && courses.length === 0 && (
            <div className="rounded-xl border border-gray-200 p-10 text-center">
              <h2 className="font-semibold text-gray-900">
                {search ? `No courses match "${search}"` : 'No courses found'}
              </h2>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 font-semibold text-green-700 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {!loading && !result.error && courses.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>

              <div className="mt-8">
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(nextPage) =>
                    updateParams({ page: nextPage > 1 ? String(nextPage) : '' })
                  }
                />
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default CoursesPage
