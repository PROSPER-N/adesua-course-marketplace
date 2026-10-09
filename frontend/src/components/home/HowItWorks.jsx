import { useRef } from 'react'
import { useReveal } from '../../hooks/useReveal.js'

const STEPS = [
  {
    title: 'Find a course',
    text: 'Search or browse categories, and see the full lesson list before you pay.',
  },
  {
    title: 'Enroll or buy',
    text: 'Free courses open straight away. Paid ones take one short checkout.',
  },
  {
    title: 'Learn and track progress',
    text: 'Mark lessons complete and pick up where you left off.',
  },
]

function HowItWorks() {
  const sectionRef = useRef(null)
  useReveal(sectionRef)

  return (
    // On the dark page the night colour is close to the page colour, so hairlines mark the edges.
    // overflow-x-clip stops the numerals sliding in from the side from widening the page.
    <section
      aria-labelledby="how-it-works-heading"
      className="overflow-x-clip bg-night text-white dark:border-y dark:border-white/10"
      ref={sectionRef}
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <h2
          className="font-serif text-display font-medium"
          data-reveal=""
          id="how-it-works-heading"
        >
          How it works
        </h2>
        {/* The steps zigzag: the middle one sits on the right and slides in from that side. From
            768px each step rises beside the one before, so they read as a staircase. */}
        <ol className="mt-10 flex flex-col gap-12 md:gap-16">
          {STEPS.map(({ title, text }, index) => {
            const right = index % 2 === 1

            return (
              <li
                className={`md:w-1/2 ${index > 0 ? 'md:-mt-32' : ''} ${right ? 'ml-[25%] md:ml-auto' : ''}`}
                key={title}
              >
                {/* The list already tells screen readers the step number. */}
                <span
                  aria-hidden="true"
                  className="block font-serif text-numeral text-gold"
                  data-reveal={right ? 'right' : 'left'}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div data-reveal="">
                  <h3 className="mt-4 font-serif text-title font-semibold">{title}</h3>
                  <p className="mt-2 max-w-xs text-white/75">{text}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

export default HowItWorks
