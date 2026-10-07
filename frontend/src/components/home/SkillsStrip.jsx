import { Link } from 'react-router'

const SKILLS = [
  'React',
  'Python',
  'Excel',
  'Photography',
  'Bookkeeping',
  'Public speaking',
  'JavaScript',
  'Graphic design',
  'Marketing',
  'Data analysis',
  'Video editing',
  'UI design',
]

function SkillsStrip() {
  return (
    <section
      aria-label="Popular skills to learn"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-xl font-extrabold text-ink">Skills to explore</h2>
        <Link
          className="text-sm font-semibold text-brand-dark hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          to="/courses"
        >
          Browse courses
        </Link>
      </div>
      <div className="skills-marquee overflow-hidden">
        <div className="skills-marquee-track flex w-max">
          {/* The copy only makes the loop seamless, so screen readers and Tab skip it. */}
          {[false, true].map((duplicate) => (
            <ul
              aria-hidden={duplicate || undefined}
              className="skills-marquee-row flex w-max shrink-0 items-center gap-3 pr-3"
              key={duplicate ? 'duplicate' : 'skills'}
            >
              {SKILLS.map((skill) => (
                <li key={skill}>
                  <Link
                    className="inline-flex min-h-10 items-center whitespace-nowrap rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink hover:border-brand hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    tabIndex={duplicate ? -1 : undefined}
                    to={`/courses?search=${encodeURIComponent(skill)}`}
                  >
                    {skill}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SkillsStrip
