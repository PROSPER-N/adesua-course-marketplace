import { Link } from 'react-router'
import AutoScroller from '../ui/AutoScroller.jsx'

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
    <section aria-label="Popular skills to learn" className="pt-12 lg:pt-16">
      <AutoScroller
        getKey={(skill) => skill}
        gap="sm"
        header={
          <h2 className="text-xs font-semibold tracking-[0.12em] text-brand uppercase">
            Skills to explore
          </h2>
        }
        items={SKILLS}
        label="skills list"
        renderItem={(skill) => (
          <Link
            className="inline-flex h-11 items-center rounded-full border border-line bg-card px-5 text-base font-medium whitespace-nowrap text-ink hover:border-brand hover:text-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            to={`/courses?search=${encodeURIComponent(skill)}`}
          >
            {skill}
          </Link>
        )}
        rowClassName="mt-4"
        speed={30}
      />
    </section>
  )
}

export default SkillsStrip
