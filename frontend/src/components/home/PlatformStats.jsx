import { BookOpen, GraduationCap, Tags, UsersRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getPublicStats } from '../../api/stats.js'

const STAT_ITEMS = [
  { label: 'Courses', key: 'courses', icon: BookOpen },
  { label: 'Instructors', key: 'instructors', icon: UsersRound },
  { label: 'Learners', key: 'learners', icon: GraduationCap },
  { label: 'Categories', key: 'categories', icon: Tags },
]

const COUNT_UP_MS = 800
const REFRESH_MS = 30000

// Fast at first, then slowing down as each number reaches its value.
function easeOutCubic(progress) {
  return 1 - (1 - progress) ** 3
}

function PlatformStats() {
  const sectionRef = useRef(null)
  const [result, setResult] = useState({ loading: true, stats: null })
  // Checked once. With reduced motion the numbers appear without counting.
  const [countUp] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  // How far the count-up has gone, from 0 to 1. It stays at 1 afterwards,
  // so numbers that change later show their new value straight away.
  const [progress, setProgress] = useState(countUp ? 0 : 1)
  const hasStats = result.stats !== null

  // Loads the numbers now, then every 30 seconds while the tab is visible,
  // and again as soon as a hidden tab becomes visible.
  useEffect(() => {
    let ignore = false
    let timer = null
    let latestRequest = 0

    function load() {
      // Only the newest request may update the strip,
      // so a slow older answer can't replace newer numbers.
      latestRequest += 1
      const request = latestRequest
      getPublicStats()
        .then((stats) => {
          if (!ignore && request === latestRequest) setResult({ loading: false, stats })
        })
        .catch(() => {
          // A failed refresh keeps the numbers already on screen.
          if (!ignore && request === latestRequest) {
            setResult((current) => ({ loading: false, stats: current.stats }))
          }
        })
    }

    function handleVisibilityChange() {
      clearInterval(timer)
      if (document.visibilityState === 'visible') {
        load()
        timer = setInterval(load, REFRESH_MS)
      }
    }

    load()
    if (document.visibilityState === 'visible') timer = setInterval(load, REFRESH_MS)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      ignore = true
      clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // The count-up waits until the strip is on screen. On phones it sits below the hero,
  // so counting on load would finish before anyone scrolled down to it.
  useEffect(() => {
    if (!hasStats || !countUp) return undefined

    let frame = 0
    let start = null

    function step(time) {
      // Timed from the first frame, so a page opened in a background tab still counts when shown.
      start ??= time
      const next = Math.min((time - start) / COUNT_UP_MS, 1)
      setProgress(next)
      if (next < 1) frame = requestAnimationFrame(step)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        frame = requestAnimationFrame(step)
      },
      { threshold: 0.5 },
    )
    observer.observe(sectionRef.current)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [hasStats, countUp])

  if (!result.loading && !result.stats) return null

  return (
    <section aria-label="Live platform statistics" className="bg-surface" ref={sectionRef}>
      <div
        aria-busy={result.loading}
        className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-4 sm:px-6 lg:px-8"
      >
        {result.loading
          ? STAT_ITEMS.map(({ label }) => (
              <div aria-hidden="true" className="skeleton-shimmer h-16 rounded-xl" key={label} />
            ))
          : STAT_ITEMS.map(({ label, key, icon: Icon }) => {
              const value = result.stats[key]
              const shown = Math.round(value * easeOutCubic(progress))

              return (
                <div className="flex items-center gap-3 rounded-xl bg-card px-4 py-3" key={key}>
                  <Icon aria-hidden="true" className="size-5 shrink-0 text-brand" />
                  <div>
                    <p className="font-display text-xl font-extrabold leading-tight tabular-nums text-ink">
                      {/* Screen readers get the real number, not every step of the count. */}
                      <span aria-hidden="true">{shown.toLocaleString('en-US')}</span>
                      <span className="sr-only">{value.toLocaleString('en-US')}</span>
                    </p>
                    <p className="text-sm text-muted">{label}</p>
                  </div>
                </div>
              )
            })}
      </div>
    </section>
  )
}

export default PlatformStats
