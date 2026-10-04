import Search from 'lucide-react/dist/esm/icons/search.mjs'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import CourseCover from '../course/CourseCover.jsx'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'

const POPULAR_SEARCHES = ['React', 'Excel', 'Bookkeeping', 'Photography']

// CourseCover prints the first word of the title in big letters and cuts it to 7 letters,
// so each example title starts with a short word that fits.
const COVER_EXAMPLES = [
  { slug: 'web-development', title: 'React for beginners' },
  { slug: 'business', title: 'Excel for small businesses' },
  { slug: 'design', title: 'Figma basics' },
  { slug: 'photography', title: 'Edit photos on your phone' },
  { slug: 'programming', title: 'Java for beginners' },
  { slug: 'marketing', title: 'Ads that sell' },
]

function HomeHero({ categories, loading }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  // An example shows only while its category exists, and uses that category's current name.
  const covers = COVER_EXAMPLES.map((example) => ({
    ...example,
    category: categories.find((category) => category.slug === example.slug),
  })).filter((example) => example.category)
  const showCovers = loading || covers.length > 0

  function handleSubmit(event) {
    event.preventDefault()
    const text = search.trim()
    navigate(text ? `/courses?search=${encodeURIComponent(text)}` : '/courses')
  }

  return (
    <section className="bg-brand-soft">
      <div
        className={`mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:items-center lg:px-8 lg:py-20 ${showCovers ? 'lg:grid-cols-2' : ''}`}
      >
        <div>
          <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
            Learn practical skills from people who use them every day.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Short video courses from Ghanaian instructors in tech, business and creative work. Learn
            on your phone, at your own pace.
          </p>

          <form
            className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            onSubmit={handleSubmit}
            role="search"
          >
            <div className="flex-1">
              <Input
                aria-label="Search courses"
                name="search"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="What do you want to learn?"
                type="search"
                value={search}
              />
            </div>
            <Button type="submit">
              <Search aria-hidden="true" className="size-4" />
              Search
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-muted">Popular:</span>
            {POPULAR_SEARCHES.map((word) => (
              <Link
                className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink hover:border-brand hover:text-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                key={word}
                to={`/courses?search=${encodeURIComponent(word)}`}
              >
                {word}
              </Link>
            ))}
          </div>
        </div>

        {showCovers && (
          // Decorative examples. Below lg they sit in one row that scrolls sideways.
          // scroll-px matches px, or snapping would pull the first cover to the screen edge.
          <div
            aria-hidden="true"
            className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {loading
              ? COVER_EXAMPLES.map(({ slug }) => (
                  <div
                    className="skeleton-shimmer aspect-[16/10] w-64 shrink-0 rounded-xl lg:w-auto"
                    key={slug}
                  />
                ))
              : covers.map(({ slug, title, category }) => (
                  <div className="w-64 shrink-0 snap-start lg:w-auto" key={slug}>
                    <CourseCover category={category} title={title} />
                  </div>
                ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default HomeHero
