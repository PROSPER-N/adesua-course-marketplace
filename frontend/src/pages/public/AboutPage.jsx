import BookOpen from 'lucide-react/dist/esm/icons/book-open.mjs'
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down.mjs'
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

const TEAM = [
  {
    name: 'Prosper Ngwoke',
    initials: 'PN',
    title: 'Full-stack developer, project lead',
    summary:
      'Designed the backend and API, built sign-in, categories and the admin tools, and set up automated testing and deployment.',
  },
  {
    name: 'Folakemi Elizabeth Okeowo',
    initials: 'FO',
    title: 'Full-stack developer',
    summary:
      "Built the design system and the app's foundation, and leads the course catalogue: courses, lessons, search and the instructor dashboard.",
  },
  {
    name: 'Victor C.U Benneth',
    initials: 'VB',
    title: 'Full-stack developer',
    summary:
      'Built sign-in and sign-up, and the learning experience: checkout, enrollment, lesson progress and instructor earnings.',
  },
]

const FAQS = [
  {
    question: 'Do I need an account to browse courses?',
    answer:
      'No. You can browse every course and watch free preview lessons without an account. You only need to sign up to enroll.',
  },
  {
    question: 'Are there free courses?',
    answer:
      'Yes. Some courses are free and open straight away. Paid courses show their price in cedis.',
  },
  {
    question: 'How does payment work?',
    answer:
      'Paid courses go through a short checkout where you choose mobile money or card. Checkout currently runs in demo mode, so no real money is charged.',
  },
  {
    question: 'Can I learn on my phone?',
    answer:
      'Yes. Adesua works on phones, tablets and laptops, and your progress is saved on every lesson, so you can switch devices and carry on.',
  },
  {
    question: 'How long can I access a course?',
    answer:
      "For as long as you like. Once you're enrolled, the course stays in My learning, and you can go at your own pace.",
  },
  {
    question: 'How do I become an instructor?',
    answer:
      "Sign up and choose “Teach”. Create your course, add your lessons, and publish it when you're ready.",
  },
  {
    question: 'How do instructors see how their courses are doing?',
    answer:
      'Your instructor dashboard shows how many students each course has and what it has earned.',
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
          {TEAM.map(({ name, initials, title, summary }) => (
            <li className="rounded-xl border border-line bg-surface p-5" key={name}>
              <span
                aria-hidden="true"
                className="flex size-11 items-center justify-center rounded-full bg-gold font-bold text-ink"
              >
                {initials}
              </span>
              <p className="mt-3 font-semibold text-ink">{name}</p>
              <p className="text-sm font-semibold text-brand">{title}</p>
              <p className="mt-2 text-sm text-muted">{summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq-heading" className="mt-14 max-w-3xl">
        <h2 className="font-display text-2xl font-extrabold text-ink" id="faq-heading">
          Frequently asked questions
        </h2>
        <div className="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
          {FAQS.map(({ question, answer }) => (
            <details className="group" key={question}>
              {/* Hide the browser's own triangle, since the chevron replaces it. */}
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-ink hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown
                  aria-hidden="true"
                  className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              <p className="px-5 pb-5 text-muted">{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AboutPage
