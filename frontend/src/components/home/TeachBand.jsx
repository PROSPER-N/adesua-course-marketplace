import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../ui/Button.jsx'

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
      <div className="flex flex-col items-start gap-6 rounded-2xl bg-brand-dark px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold text-white" id="teach-heading">
            Teach what you know
          </h2>
          <p className="mt-3 text-lg text-white/80">
            Turn your skills into short video lessons, and earn when learners buy your course.
          </p>
        </div>
        {/* The Button's usual green focus ring would vanish on dark green, so this one is gold. */}
        <Button
          className="shrink-0 focus-visible:outline-gold!"
          to={isInstructor ? '/instructor' : '/register'}
          variant="gold"
        >
          {isInstructor ? 'Go to your dashboard' : 'Start teaching'}
        </Button>
      </div>
    </section>
  )
}

export default TeachBand
