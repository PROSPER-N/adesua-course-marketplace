import { BadgeCheck, Send, UsersRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../ui/Button.jsx'

const TEACHING_BENEFITS = [
  { label: 'Free to start teaching', icon: BadgeCheck },
  { label: 'See your students and earnings', icon: UsersRound },
  { label: "Publish when you're ready", icon: Send },
]

function TeachBand() {
  const { user, loading } = useAuth()

  // Wait until a saved login is checked, so a student never sees the guest version flash.
  if (loading) return null
  if (user && user.role !== 'instructor') return null

  const isInstructor = user?.role === 'instructor'

  return (
    <section
      aria-labelledby="teach-heading"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col items-start gap-6 rounded-2xl bg-band px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold text-white" id="teach-heading">
            Teach what you know
          </h2>
          <p className="mt-3 text-lg text-white/80">
            Turn your skills into short video lessons, and earn when learners buy your course.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {TEACHING_BENEFITS.map(({ label, icon: Icon }) => (
              <li
                className="flex items-center gap-2 text-sm font-semibold text-white/90"
                key={label}
              >
                <Icon aria-hidden="true" className="size-5 shrink-0 text-gold" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* The Button's usual green focus ring would vanish on dark green, so this one is gold. */}
        <Button
          className="shrink-0 focus-visible:outline-gold!"
          to={isInstructor ? '/instructor' : '/register?role=instructor'}
          variant="gold"
        >
          {isInstructor ? 'Go to your dashboard' : 'Start teaching'}
        </Button>
      </div>
    </section>
  )
}

export default TeachBand
