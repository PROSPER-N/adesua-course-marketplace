import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { getCourses } from '../../api/courses.js'
import { getCategories } from '../../api/categories.js'
import CourseCard from '../../components/course/CourseCard.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import SkeletonCard from '../../components/ui/SkeletonCard.jsx'

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
  const [courses, setCourses] = useState([])
  const [pagination, setPagination] = useState({})
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState(searchParams.get('search') ?? '')

  const filters = useMemo(() => {
    const nextFilters = {
      sort: searchParams.get('sort') ?? 'newest',
      page: Number(searchParams.get('page') ?? 1),
      limit: 9,
    }

    const searchValue = searchParams.get('search')
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const price = searchParams.get('price')

    if (searchValue) nextFilters.search = searchValue
    if (category) nextFilters.category = category
    if (level) nextFilters.level = level
    if (price) nextFilters.price = price

    return nextFilters
  }, [searchParams])

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams)

      if (search.trim()) {
        next.set('search', search.trim())
      } else {
        next.delete('search')
      }

      next.delete('page')
      setSearchParams(next)
    }, 400)

    return () => clearTimeout(timer)
  }, [search, searchParams, setSearchParams])

  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')

    getCourses(filters)
      .then((data) => {
        if (!active) return

        setCourses(data?.items ?? [])
        setPagination(data?.pagination ?? {})
      })
      .catch((err) => {
        if (!active) return

        setCourses([])
        setError(
          err?.response?.data?.message ??
            'Unable to load courses. Please try again.',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [filters])

  function updateFilter(name, value) {
    const next = new URLSearchParams(searchParams)

    if (value) {
      next.set(name, value)
    } else {
      next.delete(name)
    }

    next.delete('page')
    setSearchParams(next)
  }

  function clearFilters() {
    setSearch('')
    setSearchParams({})
  }

  const hasFilters =
    Boolean(filters.search) ||
    Boolean(filters.category) ||
    Boolean(filters.level) ||
    Boolean(filters.price)

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          Learn
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Browse courses
        </h1>

        <p className="mt-2 max-w-2xl text-gray-600">
          Find practical courses to build useful skills at your own pace.
        </p>
      </header>

      <section className="mb-8 grid gap-3 md:grid-cols-[1fr_220px]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search courses..."
          className="h-11 rounded-lg border border-gray-300 px-4 outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
        />

        <select
          value={filters.sort}
          onChange={(event) => updateFilter('sort', event.target.value)}
          className="h-11 rounded-lg border border-gray-300 px-3"
        >
          {SORTS.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </select>
      </section>

      <section className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Category
            </label>

            <select
              value={filters.category ?? ''}
              onChange={(event) =>
                updateFilter('category', event.target.value)
              }
              className="h-10 w-full rounded-lg border border-gray-300 px-3"
            >
              <option value="">All categories</option>

              {categories.map((category) => (
                <option key={category._id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Level
            </label>

            <select
              value={filters.level ?? ''}
              onChange={(event) => updateFilter('level', event.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 px-3"
            >
              <option value="">All levels</option>

              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Price
            </label>

            <select
              value={filters.price ?? ''}
              onChange={(event) => updateFilter('price', event.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 px-3"
            >
              <option value="">Any price</option>

              {PRICES.map((price) => (
                <option key={price} value={price}>
                  {price === 'free' ? 'Free' : 'Paid'}
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
          {!loading && !error && (
            <p className="mb-4 text-sm text-gray-500">
              {pagination.total ?? courses.length} course
              {(pagination.total ?? courses.length) === 1 ? '' : 's'}
            </p>
          )}

          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm text-red-700">{error}</p>

              <button
                type="button"
                onClick={() => setSearchParams(searchParams)}
                className="mt-3 font-semibold text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && courses.length === 0 && (
            <div className="rounded-xl border border-gray-200 p-10 text-center">
              <h2 className="font-semibold text-gray-900">
                {filters.search
                  ? `No courses match "${filters.search}"`
                  : 'No courses found'}
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

          {!loading && !error && courses.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => updateFilter('page', page)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default CoursesPage
