import BookOpen from 'lucide-react/dist/esm/icons/book-open.mjs'
import Compass from 'lucide-react/dist/esm/icons/compass.mjs'
import { useState } from 'react'
import CourseCover from '../../components/course/CourseCover.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorMessage from '../../components/ui/ErrorMessage.jsx'
import Input from '../../components/ui/Input.jsx'
import NoPermission from '../../components/ui/NoPermission.jsx'
import PageLoader from '../../components/ui/PageLoader.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import Select from '../../components/ui/Select.jsx'
import SkeletonCard from '../../components/ui/SkeletonCard.jsx'
import SkeletonRow from '../../components/ui/SkeletonRow.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Textarea from '../../components/ui/Textarea.jsx'

const buttonVariants = ['primary', 'outline', 'ghost', 'danger', 'gold']
const categories = [
  { name: 'Web Development', slug: 'web-development' },
  { name: 'Programming', slug: 'programming' },
  { name: 'Business', slug: 'business' },
  { name: 'Design', slug: 'design' },
  { name: 'Marketing', slug: 'marketing' },
  { name: 'Photography', slug: 'photography' },
  { name: 'Personal Growth', slug: 'personal-growth' },
  { name: 'Other', slug: 'other' },
]

function ComponentSection({ title, children }) {
  return (
    <section className="grid gap-4 border-b border-line py-8 last:border-0">
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      {children}
    </section>
  )
}

function ComponentsPage() {
  const [firstPage, setFirstPage] = useState(1)
  const [secondPage, setSecondPage] = useState(2)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">
          Adesua design system
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">Component gallery</h1>
        <p className="mt-2 text-muted">Shared interface pieces and their common states.</p>
      </header>

      <ComponentSection title="Buttons">
        <div className="grid gap-4">
          {buttonVariants.map((variant) => (
            <div className="flex flex-wrap items-center gap-3" key={variant}>
              <Button variant={variant}>{variant}</Button>
              <Button loading loadingText="Saving…" variant={variant}>
                {variant} loading
              </Button>
            </div>
          ))}
          <div className="max-w-sm">
            <Button fullWidth>Full width</Button>
          </div>
        </div>
      </ComponentSection>

      <ComponentSection title="Form fields">
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Email address"
            placeholder="you@example.com"
            hint="We will only use this to contact you."
            type="email"
          />
          <Input
            label="Email address with error"
            error="Enter a valid email address."
            value="not-an-email"
            readOnly
          />
          <Textarea
            label="Course description"
            hint="Tell learners what they will study."
            placeholder="Write a short description…"
          />
          <Textarea
            label="Description with error"
            error="Please add a description."
            value=""
            readOnly
          />
          <Select label="Category" defaultValue="web-development">
            <option value="web-development">Web Development</option>
            <option value="business">Business</option>
          </Select>
          <Select label="Category with error" defaultValue="" error="Choose a category.">
            <option value="">Choose one</option>
            <option value="design">Design</option>
          </Select>
        </div>
      </ComponentSection>

      <ComponentSection title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge variant="green">Published</Badge>
          <Badge variant="gold">In progress</Badge>
          <Badge variant="red">Needs attention</Badge>
        </div>
      </ComponentSection>

      <ComponentSection title="Loading states">
        <div className="flex items-center gap-6">
          <Spinner className="size-6 text-brand" />
          <span className="sr-only">Spinner preview</span>
          <div className="flex-1 rounded-xl border border-line">
            <PageLoader label="Loading courses" />
          </div>
        </div>
      </ComponentSection>

      <ComponentSection title="Skeletons">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <div className="rounded-xl border border-line px-4">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        </div>
      </ComponentSection>

      <ComponentSection title="Feedback">
        <div className="grid gap-5 md:grid-cols-2">
          <ErrorMessage
            message="We could not load these courses. Check your connection and try again."
            onRetry={() => {}}
          />
          <EmptyState
            action={<Button size="sm">Browse courses</Button>}
            icon={BookOpen}
            message="Courses you enroll in will be saved here."
            title="Nothing here yet"
          />
        </div>
      </ComponentSection>

      <ComponentSection title="Pagination">
        <div className="grid gap-5">
          <Pagination onPageChange={setFirstPage} page={firstPage} totalPages={3} />
          <Pagination onPageChange={setSecondPage} page={secondPage} totalPages={3} />
        </div>
      </ComponentSection>

      <ComponentSection title="Progress">
        <div className="grid max-w-xl gap-2">
          <div className="flex justify-between text-sm">
            <span>Course progress</span>
            <span>68%</span>
          </div>
          <ProgressBar label="Course progress" value={68} />
        </div>
      </ComponentSection>

      <ComponentSection title="No permission">
        <div className="rounded-xl border border-line">
          <NoPermission />
        </div>
      </ComponentSection>

      <ComponentSection title="Course covers">
        <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CourseCover
              category={category}
              key={category.slug}
              title={`${category.name} for beginners`}
            />
          ))}
        </div>
      </ComponentSection>

      <ComponentSection title="Icon example">
        <div className="flex items-center gap-2 text-muted">
          <Compass aria-hidden="true" className="size-5" /> Lucide icons can be used as components.
        </div>
      </ComponentSection>
    </main>
  )
}

export default ComponentsPage
