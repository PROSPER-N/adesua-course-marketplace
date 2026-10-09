import { Eye, EyeOff } from 'lucide-react'
import { useId, useState } from 'react'
import FormField from './FormField.jsx'

function PasswordField({ id, size = 'md', ...props }) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const [shown, setShown] = useState(false)

  return (
    <FormField
      action={
        <button
          aria-controls={fieldId}
          aria-label="Show password"
          aria-pressed={shown}
          className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={() => setShown((current) => !current)}
          type="button"
        >
          {shown ? (
            <EyeOff aria-hidden="true" className="size-5" />
          ) : (
            <Eye aria-hidden="true" className="size-5" />
          )}
        </button>
      }
      id={fieldId}
      size={size}
      type={shown ? 'text' : 'password'}
      {...props}
    />
  )
}

export default PasswordField
