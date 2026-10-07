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
    <section aria-labelledby="how-it-works-heading" className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <h2
          className="font-display text-2xl font-extrabold text-ink sm:text-3xl"
          id="how-it-works-heading"
        >
          How it works
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map(({ title, text }, index) => (
            <li className="rounded-xl border border-line bg-card p-6" key={title}>
              {/* The list already tells screen readers the step number. */}
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-full bg-brand-fill font-display text-lg font-bold text-white"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-ink">{title}</h3>
              <p className="mt-2 text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default HowItWorks
