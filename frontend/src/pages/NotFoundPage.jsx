import Button from '../components/ui/Button.jsx'

function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-6xl flex-col items-start justify-center px-4 py-12 sm:px-6 lg:px-8">
      <p className="font-semibold text-brand">404</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold text-ink">Page not found</h1>
      <p className="mt-3 max-w-lg text-muted">
        The page may have moved, or the address may be wrong.
      </p>
      <Button className="mt-6" to="/">
        Go to the home page
      </Button>
    </section>
  )
}

export default NotFoundPage
