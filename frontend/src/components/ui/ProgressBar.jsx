function ProgressBar({ value = 0, label = 'Progress', className = '' }) {
  const progress = Math.min(100, Math.max(0, Number(value) || 0))

  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={progress}
      className={`h-2 overflow-hidden rounded-full bg-brand-soft ${className}`}
      role="progressbar"
    >
      <div
        className="h-full rounded-full bg-brand transition-[width]"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default ProgressBar
