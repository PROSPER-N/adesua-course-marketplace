import { BookCheck, FilePenLine, Users, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getInstructorStats } from '../../api/instructor.js'
import { formatMoney } from '../../utils/formatMoney.js'
import { getErrorMessage } from '../../utils/getErrorMessage.js'
import ErrorMessage from '../ui/ErrorMessage.jsx'

// formatMoney(0) says "Free", which fits a price but not a total.
function formatEarnings(total) {
  return total > 0 ? formatMoney(total) : '$0'
}

function InstructorStats() {
  // A result remembers the attempt it answers, so the cards load until the latest attempt has one.
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ attempt: -1, stats: null, error: null })
  const loading = result.attempt !== attempt

  useEffect(() => {
    let ignore = false
    getInstructorStats()
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
          <div className="rounded-xl border border-line bg-white p-5" key={index}>
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
        title="Couldn't load your stats"
      />
    )
  }

  // With no courses yet, every card shows 0.
  const { stats } = result
  const cards = [
    { label: 'Students', value: stats.totalStudents.toLocaleString('en-US'), icon: Users },
    { label: 'Earnings', value: formatEarnings(stats.totalEarnings), icon: Wallet },
    { label: 'Published', value: stats.publishedCount.toLocaleString('en-US'), icon: BookCheck },
    { label: 'Drafts', value: stats.draftCount.toLocaleString('en-US'), icon: FilePenLine },
  ]

  return (
    <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon }) => (
        <div
          className="flex flex-col justify-between gap-3 rounded-xl border border-line bg-white p-5"
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

export default InstructorStats
