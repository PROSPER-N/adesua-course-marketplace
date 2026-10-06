import { Link, useSearchParams } from 'react-router'
import AdminStats from '../../components/admin/AdminStats.jsx'
import CategoriesTab from '../../components/admin/CategoriesTab.jsx'
import CoursesTab from '../../components/admin/CoursesTab.jsx'
import UsersTab from '../../components/admin/UsersTab.jsx'

const TABS = [
  { id: 'users', label: 'Users' },
  { id: 'categories', label: 'Categories' },
  { id: 'courses', label: 'Courses' },
]

function AdminDashboardPage() {
  const [searchParams] = useSearchParams()
  // The tab lives in the URL, so a refresh or a shared link opens the same tab.
  const tab = ['categories', 'courses'].includes(searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'users'

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
          Admin dashboard
        </h1>
        <p className="mt-2 text-muted">
          Platform totals, user accounts and course categories in one place.
        </p>
      </header>

      <div className="mt-8">
        <AdminStats />
      </div>

      <nav aria-label="Admin sections" className="mt-10 flex gap-6 border-b border-line">
        {TABS.map(({ id, label }) => {
          const active = tab === id
          return (
            <Link
              aria-current={active ? 'page' : undefined}
              className={`-mb-px rounded-t-md border-b-2 px-1 pb-3 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${active ? 'border-brand text-brand-dark' : 'border-transparent text-muted hover:text-ink'}`}
              key={id}
              to={`?tab=${id}`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-6">
        {tab === 'categories' ? (
          <CategoriesTab />
        ) : tab === 'courses' ? (
          <CoursesTab key={searchParams.get('search') ?? ''} />
        ) : (
          <UsersTab />
        )}
      </div>
    </div>
  )
}

export default AdminDashboardPage
