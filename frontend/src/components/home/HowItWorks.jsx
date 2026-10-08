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
  return (
    // On the dark page the night colour is close to the page colour, so hairlines mark the edges.
    <section
      aria-labelledby="how-it-works-heading"
      className="bg-night text-white dark:border-y dark:border-white/10"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <h2 className="font-serif text-display font-medium" id="how-it-works-heading">
          How it works
        </h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-0">
          {STEPS.map(({ title, text }, index) => (
            <li
              className="md:border-l md:border-white/15 md:px-8 md:first:border-l-0 md:first:pl-0"
              key={title}
            >
              {/* The list already tells screen readers the step number. */}
              <span aria-hidden="true" className="block font-serif text-numeral text-gold">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 font-serif text-title font-semibold">{title}</h3>
              <p className="mt-2 max-w-xs text-white/75">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default HowItWorks
