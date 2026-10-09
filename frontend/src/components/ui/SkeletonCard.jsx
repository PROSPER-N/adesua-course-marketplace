// The default matches the cards in My learning. course matches CourseCard, with its rounder
// corners, padding and price row.
function SkeletonCard({ course = false }) {
  return (
    <div
      aria-hidden="true"
      className={`overflow-hidden border border-line bg-card ${course ? 'h-full rounded-2xl' : 'rounded-xl'}`}
    >
      <div className="skeleton-shimmer aspect-[16/10]" />
      <div className={`grid gap-3 ${course ? 'p-5' : 'p-4'}`}>
        <div className="skeleton-shimmer h-3 w-1/3 rounded" />
        <div className="skeleton-shimmer h-5 w-5/6 rounded" />
        <div className="skeleton-shimmer h-3 w-1/2 rounded" />
        {course && (
          <div className="mt-2 flex justify-between border-t border-line pt-4">
            <div className="skeleton-shimmer h-4 w-24 rounded" />
            <div className="skeleton-shimmer h-4 w-12 rounded" />
          </div>
        )}
      </div>
    </div>
  )
}

export default SkeletonCard
