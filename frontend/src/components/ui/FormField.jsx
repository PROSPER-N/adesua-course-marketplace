import { useId } from 'react'
import CircleAlert from 'lucide-react/dist/esm/icons/circle-alert.mjs'

function FormField({ as: Element = 'input', label, error, hint, id, className = '', children, ...props }) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const baseClassName = `w-full rounded-lg border bg-white px-3 py-2.5 text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${error ? 'border-danger' : 'border-line'} ${className}`

  return (
    <div className="grid gap-1.5">
      {label && <label className="text-sm font-semibold text-ink" htmlFor={fieldId}>{label}</label>}
      <Element
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={baseClassName}
        id={fieldId}
        {...props}
      >
        {children}
      </Element>
      {hint && <p className="text-sm text-muted" id={hintId}>{hint}</p>}
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-danger" id={errorId}>
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
