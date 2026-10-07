const THEME_KEY = 'adesua-theme'
const THEME_EVENT = 'adesua:theme-updated'
const CHOICES = ['light', 'dark', 'system']
// The browser bar colour on phones. index.html uses the same colours before the app loads.
const BAR_COLORS = { light: '#1e6b4a', dark: '#0e1512' }

const systemDark = window.matchMedia('(prefers-color-scheme: dark)')

function readChoice() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    return CHOICES.includes(saved) ? saved : 'system'
  } catch {
    // Storage can be blocked, for example in some private windows. Then the device decides.
    return 'system'
  }
}

// Kept here too, so a new choice still works until the page closes when storage is blocked.
let choice = readChoice()

export function getThemeChoice() {
  return choice
}

function applyTheme() {
  const theme = choice === 'dark' || (choice === 'system' && systemDark.matches) ? 'dark' : 'light'
  document.documentElement.dataset.theme = theme
  // Form controls and scrollbars follow color-scheme.
  document.documentElement.style.colorScheme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAR_COLORS[theme])
}

export function setThemeChoice(next) {
  choice = next
  try {
    localStorage.setItem(THEME_KEY, next)
  } catch {
    // The choice still applies, but only until the page closes.
  }
  applyTheme()
  window.dispatchEvent(new Event(THEME_EVENT))
}

export function subscribeToTheme(callback) {
  window.addEventListener(THEME_EVENT, callback)
  return () => window.removeEventListener(THEME_EVENT, callback)
}

// index.html has already set the theme. This keeps it up to date when the device setting changes
// (for System) and when another tab picks a theme.
export function startTheme() {
  applyTheme()
  systemDark.addEventListener('change', () => {
    if (choice === 'system') applyTheme()
  })
  window.addEventListener('storage', (event) => {
    if (event.key && event.key !== THEME_KEY) return
    choice = readChoice()
    applyTheme()
    window.dispatchEvent(new Event(THEME_EVENT))
  })
}
