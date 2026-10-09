import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { getThemeChoice, setThemeChoice, subscribeToTheme } from '../../utils/theme.js'

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

// One button in the navbar, which opens the three choices.
function ThemeMenu({ choice, className }) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const wrapperRef = useRef(null)
  const buttonRef = useRef(null)
  const CurrentIcon = OPTIONS.find(({ value }) => value === choice)?.icon ?? Monitor

  useEffect(() => {
    if (!open) return undefined

    function closeIfOutside(event) {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false)
    }

    function handleKeyDown(event) {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }

    // focusin rather than blur: some browsers don't focus a button when it's clicked,
    // and closing on blur would remove the choices before the click lands.
    document.addEventListener('pointerdown', closeIfOutside)
    document.addEventListener('focusin', closeIfOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', closeIfOutside)
      document.removeEventListener('focusin', closeIfOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-label="Theme"
        className="inline-flex size-11 items-center justify-center rounded-lg text-brand-dark hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        onClick={() => setOpen((current) => !current)}
        ref={buttonRef}
        type="button"
      >
        <CurrentIcon aria-hidden="true" className="size-5" />
      </button>
      {open && (
        <div
          aria-label="Theme"
          className="absolute right-0 top-full z-50 mt-2 grid w-44 gap-1 rounded-xl border border-line bg-card p-1 shadow-lg"
          id={menuId}
          role="group"
        >
          {OPTIONS.map(({ value, label, icon: Icon }) => {
            const active = choice === value

            return (
              <button
                aria-pressed={active}
                className={`flex min-h-10 items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand ${active ? 'bg-brand-soft text-brand-dark' : 'text-ink hover:bg-surface'}`}
                key={value}
                onClick={() => {
                  setThemeChoice(value)
                  setOpen(false)
                  buttonRef.current?.focus()
                }}
                type="button"
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <Check aria-hidden="true" className="size-4 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Light, Dark or System. The navbar shows one on wide screens and another on phones, and
// either can change the theme, so both listen for changes.
function ThemeToggle({ className = '' }) {
  const [choice, setChoice] = useState(getThemeChoice)

  useEffect(() => subscribeToTheme(() => setChoice(getThemeChoice())), [])

  return <ThemeMenu choice={choice} className={className} />
}

export default ThemeToggle
