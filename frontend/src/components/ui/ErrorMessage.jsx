import CircleAlert from 'lucide-react/dist/esm/icons/circle-alert.mjs'
import Button from './Button.jsx'

function ErrorMessage({ title = 'Something went wrong', message, onRetry }) {
  return (
    <section className="rounded-xl border border-danger/30 bg-danger-soft p-5" role="alert">
      <div className="flex items-start gap-3">
        <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-danger" />
        <div>
          <h2 className="font-semibold text-ink">{title}</h2>
          {message && <p className="mt-1 text-sm text-muted">{message}</p>}
          {onRetry && (
            <Button className="mt-4" onClick={onRetry} size="sm" variant="outline">
              Try again
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

export default ErrorMessage
