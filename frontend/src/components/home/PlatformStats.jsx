import { BookOpen, GraduationCap, Tags, UsersRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getPublicStats } from '../../api/stats.js'

const STAT_ITEMS = [
  { label: 'Courses', key: 'courses', icon: BookOpen },
  { label: 'Instructors', key: 'instructors', icon: UsersRound },
  { label: 'Learners', key: 'learners', icon: GraduationCap },
  { label: 'Categories', key: 'categories', icon: Tags },
]

function PlatformStats() {
  const [result, setResult] = useState({ loading: true, stats: null })

  useEffect(() => {
    let ignore = false

    getPublicStats()
      .then((stats) => {
        if (!ignore) setResult({ loading: false, stats })
      })
      .catch(() => {
        if (!ignore) setResult({ loading: false, stats: null })
      })

    return () => {
      ignore = true
    }
  }, [])

  if (!result.loading && !result.stats) return null

  return (
    <section aria-label="Live platform statistics" className="bg-surface">
      <div
        aria-busy={result.loading}
        className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-4 sm:px-6 lg:px-8"
      >
        {result.loading
          ? STAT_ITEMS.map(({ label }) => (
              <div
                aria-hidden="true"
                className="skeleton-shimmer h-16 rounded-xl"
                key={label}
              />
            ))
          : STAT_ITEMS.map(({ label, key, icon: Icon }) => (
              <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3" key={key}>
                <Icon aria-hidden="true" className="size-5 shrink-0 text-brand" />
                <div>
                  <p className="font-display text-xl font-extrabold leading-tight text-ink">
                    {result.stats[key].toLocaleString('en-US')}
                  </p>
                  <p className="text-sm text-muted">{label}</p>
                </div>
              </div>
            ))}
      </div>
    </section>
  )
}

export default PlatformStats
