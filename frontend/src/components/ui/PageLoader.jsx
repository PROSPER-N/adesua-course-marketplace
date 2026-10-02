import Spinner from './Spinner.jsx'

function PageLoader({ label = 'Loading page' }) {
  return (
    <div className="flex min-h-64 items-center justify-center" role="status">
      <Spinner className="size-8 text-brand" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export default PageLoader
