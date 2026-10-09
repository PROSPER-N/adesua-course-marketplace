import { useSyncExternalStore } from 'react'

function subscribe(onChange) {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

// False while the tab is in the background, so moving parts can wait until it's back.
export function usePageVisible() {
  return useSyncExternalStore(subscribe, () => document.visibilityState === 'visible')
}
