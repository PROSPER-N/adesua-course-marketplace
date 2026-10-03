import BookOpen from 'lucide-react/dist/esm/icons/book-open.mjs'
import Lightbulb from 'lucide-react/dist/esm/icons/lightbulb.mjs'
import ListChecks from 'lucide-react/dist/esm/icons/list-checks.mjs'
import Users from 'lucide-react/dist/esm/icons/users.mjs'

const QUESTIONS = [
  {
    icon: BookOpen,
    question: 'What is Adesua?',
    answer:
      'Adesua is a course marketplace. Instructors in Ghana publish practical video courses. Learners enroll in free courses or buy paid ones, then track their progress.',
  },
  {
    icon: Users,
    question: 'Who is it for?',
    answer:
      'Learners who want job-ready skills they can study on a phone, and instructors who want to earn from what they know.',
  },
  {
    icon: Lightbulb,
    question: 'What problem does it solve?',
    answer:
      'Good local teachers have no simple place to sell their courses. Learners struggle to find courses priced and taught for their context. Adesua puts both in one place.',
  },
  {
    icon: ListChecks,
    question: 'How do I use it?',
    answer:
      "Sign up and find a course. Enroll if it's free, or buy it if it's paid. Then work through the lessons and mark each one complete. Instructors sign up to teach and publish from their dashboard. The checkout is a demo and takes no real payments.",
  },
]

// Names and roles follow the team table in the README.
const TEAM = [
  {
    name: 'Prosper Ngwoke',
    initials: 'PN',
    role: 'Member A, project lead',
    work: 'Repo setup, backend foundation, login API, categories, admin, team docs.',
  },
  {
    name: 'Folakemi Elizabeth Okeowo',
    initials: 'FO',
    role: 'Member B',
    work: 'Frontend foundation, course and lesson models, courses, lessons, instructor dashboard.',
  },
  {
    name: 'Victor C.U Benneth',
    initials: 'VB',
    role: 'Member C',
    work: 'Order and enrollment models, connecting the frontend to the backend, checkout, learning and progress, instructor stats.',
  },
]

function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">About Adesua</h1>
        <p className="mt-3 text-lg text-muted">Adesua means “learning” in Twi.</p>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {QUESTIONS.map(({ icon: Icon, question, answer }) => (
          <section className="rounded-xl border border-line bg-white p-6" key={question}>
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <h2 className="mt-4 font-display text-xl font-bold text-ink">{question}</h2>
            <p className="mt-2 text-muted">{answer}</p>
          </section>
        ))}
      </div>

      <section aria-labelledby="team-heading" className="mt-14">
        <h2 className="font-display text-2xl font-extrabold text-ink" id="team-heading">
          The team
        </h2>
        <ul className="mt-5 grid gap-4 md:grid-cols-3">
          {TEAM.map(({ name, initials, role, work }) => (
            <li className="rounded-xl border border-line bg-surface p-5" key={name}>
              <span
                aria-hidden="true"
                className="flex size-11 items-center justify-center rounded-full bg-gold font-bold text-ink"
              >
                {initials}
              </span>
              <p className="mt-3 font-semibold text-ink">{name}</p>
              <p className="text-sm font-semibold text-brand">{role}</p>
              <p className="mt-2 text-sm text-muted">{work}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 rounded-xl bg-gold-soft px-5 py-4 text-ink">
          Built for the TS Academy full-stack capstone, topic 56.
        </p>
      </section>
    </div>
  )
}

export default AboutPage
