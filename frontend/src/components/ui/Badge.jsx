const colors = {
  neutral: 'bg-surface text-muted',
  green: 'bg-brand-soft text-brand-dark',
  gold: 'bg-gold-soft text-ink',
  red: 'bg-danger-soft text-danger',
}

function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${colors[variant] ?? colors.neutral} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
