import { Link } from 'react-router'

const columns = [
  {
    title: 'Learn',
    links: [
      { label: 'Browse courses', to: '/courses' },
      { label: 'My learning', to: '/my-learning' },
    ],
  },
  {
    title: 'Teach',
    links: [
      { label: 'Instructor dashboard', to: '/instructor' },
      { label: 'Create a course', to: '/instructor/courses/new' },
    ],
  },
  {
    title: 'Adesua',
    links: [
      { label: 'About us', to: '/about' },
      { label: 'Reviews', to: '/reviews' },
      { label: 'Home', to: '/' },
    ],
  },
]

function Footer() {
  return (
    // On the dark page the footer's green is close to the page colour, so a border marks the edge.
    <footer className="bg-footer text-white dark:border-t dark:border-line">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        {columns.map(({ title, links }) => (
          <section key={title}>
            <h2 className="font-serif text-lg font-semibold">{title}</h2>
            <ul className="mt-3 grid gap-2">
              {links.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    className="rounded-sm text-sm text-white/75 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    to={to}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="border-t border-white/15 px-4 py-4 text-center text-sm text-white/75">
        © 2026 Adesua. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
