import { BookOpen, GraduationCap, Users, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getAdminStats } from '../../api/admin.js'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import { getErrorMessage } from '../../utils/getErrorMessage.js'
import ErrorMessage from '../ui/ErrorMessage.jsx'

function AdminStats() {
  const { formatAmount } = useCurrency()
  // A result remembers the attempt it answers, so the cards load until the latest attempt has one.
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ attempt: -1, stats: null, error: null })
  const loading = result.attempt !== attempt

  useEffect(() => {
    let ignore = false
    getAdminStats()
      .then((stats) => {
        if (!ignore) setResult({ attempt, stats, error: null })
      })
      .catch((error) => {
        if (!ignore) setResult({ attempt, stats: null, error })
      })

    return () => {
      ignore = true
    }
  }, [attempt])

  if (loading) {
    return (
      <div aria-hidden="true" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="rounded-xl border border-line bg-card p-5" key={index}>
            <div className="skeleton-shimmer h-4 w-24 rounded" />
            <div className="skeleton-shimmer mt-4 h-8 w-16 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (result.error) {
    return (
      <ErrorMessage
        message={getErrorMessage(result.error)}
        onRetry={() => setAttempt((current) => current + 1)}
        title="Couldn't load the platform totals"
      />
    )
  }

  const { stats } = result
  const cards = [
    { label: 'Users', value: stats.users.toLocaleString('en-US'), icon: Users },
    {
      label: 'Published courses',
      value: stats.publishedCourses.toLocaleString('en-US'),
      icon: BookOpen,
    },
    { label: 'Enrollments', value: stats.enrollments.toLocaleString('en-US'), icon: GraduationCap },
    { label: 'Payments', value: formatAmount(stats.totalPayments), icon: Wallet },
  ]

  return (
    <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon }) => (
        // justify-between keeps the numbers in a row level when one label wraps to two lines.
        <div
          className="flex flex-col justify-between gap-3 rounded-xl border border-line bg-card p-5"
          key={label}
        >
          <div className="flex items-start justify-between gap-2">
            <dt className="text-sm font-semibold text-muted">{label}</dt>
            <Icon aria-hidden="true" className="size-5 shrink-0 text-brand" />
          </div>
          <dd className="font-display text-3xl font-extrabold text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default AdminStats
