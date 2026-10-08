import { Pause, Play } from 'lucide-react'
import { useState } from 'react'
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
  const [paused, setPaused] = useState(false)

  return (
    <section aria-label="Popular skills to learn" className="border-b border-line">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pt-6 sm:px-6 lg:px-8">
        <h2 className="text-xs font-semibold tracking-[0.12em] text-brand uppercase">
          Skills to explore
        </h2>
        {/* With reduced motion the list doesn't move, so there's nothing to pause. */}
        <button
          aria-label={paused ? 'Play the skills list' : 'Pause the skills list'}
          className="inline-flex size-9 items-center justify-center rounded-full text-muted ring-1 ring-line hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:hidden"
          onClick={() => setPaused((current) => !current)}
          type="button"
        >
          {paused ? (
            <Play aria-hidden="true" className="size-4" />
          ) : (
            <Pause aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>
      <div className="skills-marquee overflow-hidden py-5" data-paused={paused || undefined}>
        <div className="skills-marquee-track flex w-max">
          {/* The copy only makes the loop seamless, so screen readers and Tab skip it. */}
          {[false, true].map((duplicate) => (
            <ul
              aria-hidden={duplicate || undefined}
              className="skills-marquee-row flex w-max shrink-0 items-center gap-5 pr-5"
              key={duplicate ? 'duplicate' : 'skills'}
            >
              {SKILLS.map((skill) => (
                <li className="flex items-center gap-5" key={skill}>
                  <Link
                    className="rounded-sm font-serif text-2xl font-semibold whitespace-nowrap text-ink decoration-1 underline-offset-4 hover:text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    tabIndex={duplicate ? -1 : undefined}
                    to={`/courses?search=${encodeURIComponent(skill)}`}
                  >
                    {skill}
                  </Link>
                  <span aria-hidden="true" className="skills-dot size-1.5 rounded-full bg-gold" />
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
