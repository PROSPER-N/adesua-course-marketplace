import { Link } from 'react-router'
import Spinner from './Spinner.jsx'

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  outline: 'border border-line bg-white text-ink hover:bg-surface',
  ghost: 'text-ink hover:bg-surface',
  danger: 'bg-danger text-white hover:bg-danger/90',
  gold: 'bg-gold text-ink hover:brightness-95',
}

const sizes = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-base',
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  loadingText = 'Loading…',
  to,
  className = '',
  onClick,
  disabled = false,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${fullWidth ? 'w-full' : ''} ${className}`
  const content = (
    <>
      {loading && <Spinner />}
      {loading ? loadingText : children}
    </>
  )

  if (to) {
    return (
      <Link
        aria-disabled={loading || disabled || undefined}
        className={classes}
        onClick={(event) => {
          if (loading || disabled) {
            event.preventDefault()
            return
          }
          onClick?.(event)
        }}
        tabIndex={loading || disabled ? -1 : undefined}
        to={to}
        {...props}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      type="button"
      {...props}
    >
      {content}
    </button>
  )
}

export default Button
