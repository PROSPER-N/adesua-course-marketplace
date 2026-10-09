import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router'
import Reveal from '../../components/ui/Reveal.jsx'

const FAQ_GROUPS = [
  {
    id: 'getting-started',
    title: 'Getting started',
    questions: [
      {
        question: 'What is Adesua?',
        answer:
          'Adesua is a course marketplace where instructors publish practical video courses and learners enroll, watch lessons and track their progress.',
      },
      {
        question: 'Do I need an account to browse?',
        answer:
          'No. You can browse courses and watch free preview lessons without an account. You need an account to enroll.',
      },
      {
        question: 'How do I create an account?',
        answer:
          'Choose Sign up, then choose whether you want to learn or teach. Learners can choose interests; instructors add a headline and teaching area.',
      },
    ],
  },
  {
    id: 'buying-and-enrolling',
    title: 'Buying and enrolling',
    questions: [
      {
        question: 'Are there free courses?',
        answer:
          'Yes. Free courses open as soon as you enroll. Paid courses show their price before checkout.',
      },
      {
        question: 'How does payment work?',
        answer:
          'Paid courses go through a short demo checkout. No real payment is taken; the amount is shown in US dollars when you place the order.',
      },
      {
        question: 'Does my cart stay on this device?',
        answer:
          'Your cart is saved in this browser, so it stays available here before you sign in. It does not sync between browsers or devices.',
      },
    ],
  },
  {
    id: 'learning',
    title: 'Learning',
    questions: [
      {
        question: 'Where do I find my courses?',
        answer:
          'After enrolling or completing checkout, open My learning to find your courses and continue with the next lesson.',
      },
      {
        question: 'How do I track my progress?',
        answer:
          'Mark lessons complete in the lesson player. Your progress is saved with your account.',
      },
      {
        question: 'Can I learn on my phone?',
        answer: 'Yes. Adesua works on phones, tablets and desktop browsers.',
      },
    ],
  },
  {
    id: 'teaching',
    title: 'Teaching',
    questions: [
      {
        question: 'How do I become an instructor?',
        answer:
          'Sign up and choose “I want to teach”. Add your professional headline and main teaching area, then create courses from your instructor dashboard.',
      },
      {
        question: 'When does my course become available?',
        answer:
          'New courses start as drafts. Review your course and publish it from your instructor dashboard when it is ready.',
      },
      {
        question: 'How do I see students and earnings?',
        answer: 'Your instructor dashboard shows student totals and earnings for your courses.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    questions: [
      {
        question: 'How do I get help with my account?',
        answer:
          'Adesua does not currently have a contact form, support inbox or messaging service. This page is the available help resource.',
      },
    ],
  },
]

function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.12em] text-brand uppercase">Help</p>
        <Reveal as="h1" className="mt-2 font-serif text-display font-medium text-ink">
          Help & support
        </Reveal>
        <p className="mt-4 text-lg text-muted">
          Answers about finding courses, learning, teaching and your account.
        </p>
      </header>

      <div className="mt-10 grid gap-10">
        {FAQ_GROUPS.map(({ id, title, questions }) => (
          <section aria-labelledby={`help-${id}`} key={id}>
            <h2 className="font-serif text-title font-semibold text-ink" id={`help-${id}`}>
              {title}
            </h2>
            <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
              {questions.map(({ question, answer }) => (
                <details className="group" key={question}>
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
        ))}
      </div>

      <p className="mt-12 text-sm text-muted">
        Looking for an instructor or a course?{' '}
        <Link
          className="font-semibold text-brand-dark underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          to="/courses"
        >
          Browse courses
        </Link>
        .
      </p>
    </div>
  )
}

export default HelpPage
