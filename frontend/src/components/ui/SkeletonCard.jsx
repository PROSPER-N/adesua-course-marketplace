function SkeletonCard() {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-xl border border-line bg-card">
      <div className="skeleton-shimmer aspect-[16/10]" />
      <div className="grid gap-3 p-4">
        <div className="skeleton-shimmer h-3 w-1/3 rounded" />
        <div className="skeleton-shimmer h-5 w-5/6 rounded" />
        <div className="skeleton-shimmer h-3 w-1/2 rounded" />
      </div>
    </div>
  )
}

export default SkeletonCard
