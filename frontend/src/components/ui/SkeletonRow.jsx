function SkeletonRow({ columns = 4 }) {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-4 border-b border-line py-4 last:border-0"
    >
      {Array.from({ length: columns }, (_, index) => (
        <div
          className={`skeleton-shimmer h-4 rounded ${index === 0 ? 'w-1/3' : 'w-1/5'}`}
          key={index}
        />
      ))}
    </div>
  )
}

export default SkeletonRow
