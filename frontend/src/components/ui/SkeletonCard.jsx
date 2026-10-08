// framed matches cards with a border and padding, like My learning. Course cards have no frame.
function SkeletonCard({ framed = true }) {
  return (
    <div
      aria-hidden="true"
      className={framed ? 'overflow-hidden rounded-xl border border-line bg-card' : ''}
    >
      <div className={`skeleton-shimmer aspect-[16/10] ${framed ? '' : 'rounded-xl'}`} />
      <div className={`grid gap-3 ${framed ? 'p-4' : 'pt-4'}`}>
        <div className="skeleton-shimmer h-3 w-1/3 rounded" />
        <div className="skeleton-shimmer h-5 w-5/6 rounded" />
        <div className="skeleton-shimmer h-3 w-1/2 rounded" />
      </div>
    </div>
  )
}

export default SkeletonCard
