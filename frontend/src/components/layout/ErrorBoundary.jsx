import { Component } from 'react'
import Button from '../ui/Button.jsx'

// Catches an error thrown while the app renders, so a crash shows this message instead of a
// blank screen. The router may be what failed, so Home is a plain link, not a router Link.
class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="flex min-h-screen items-center justify-center bg-page px-4 py-12 sm:px-6">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl font-extrabold text-ink">Something went wrong</h1>
          <p className="mt-3 text-muted">
            Please reload the page. If it keeps happening, try again in a few minutes.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <Button onClick={() => window.location.reload()}>Reload</Button>
            <a
              className="rounded-sm font-semibold text-brand-dark underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              href="/"
            >
              Go to Home
            </a>
          </div>
        </div>
      </main>
    )
  }
}

export default ErrorBoundary
