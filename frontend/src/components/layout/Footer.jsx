
import { Link } from 'react-router'

const columns = [
  {
    title: 'Explore',
    links: [
      { label: 'Browse Courses', to: '/courses' },
      { label: 'Home', to: '/' },
    ],
  },
  {
    title: 'About Adesua',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Reviews', to: '/reviews' },
    ],
  },
  {
    title: 'Help & Support',
    links: [
      { label: 'Help Centre', to: null },
      { label: 'Contact Us', to: null },
      { label: 'FAQs', to: null },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: null },
      { label: 'Terms of Service', to: null },
    ],
  },
]

const currentYear = new Date().getFullYear()

function Footer() {
  return (
    <footer className="bg-footer text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] lg:gap-8">
          <div className="max-w-xs">
            <Link
              to="/"
              aria-label="Adesua home"
              className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              <span className="font-serif text-2xl font-semibold tracking-wide">
                Adesua<span className="text-gold">.</span>
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">
              Learn something. Build something.
            </p>

            <p className="mt-2 max-w-xs text-sm leading-6 text-white/60">
              A place to develop your skills, explore new ideas and move
              your ambitions forward.
            </p>
          </div>

          {columns.map(({ title, links }) => (
            <nav key={title} aria-label={`${title} links`}>
              <h2 className="font-serif text-base font-semibold tracking-wide text-white">
                {title}
              </h2>

              <ul className="mt-5 grid gap-3">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    {to ? (
                      <Link
                        to={to}
                        className="inline-flex rounded-sm text-sm leading-5 text-white/65 transition-colors duration-200 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                      >
                        {label}
                      </Link>
                    ) : (
                      <span
                        aria-disabled="true"
                        title="Coming soon"
                        className="inline-flex cursor-not-allowed text-sm leading-5 text-white/40"
                      >
                        {label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs leading-5 text-white/55 sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Adesua. All rights reserved.</p>
          <p>Made for curious minds and lifelong learners.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
