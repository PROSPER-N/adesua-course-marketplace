import { useGSAP } from '@gsap/react'
import { gsap, MOTION_OK, ScrollTrigger } from '../utils/gsap.js'

const EASE = 'power2.out'
const DURATION = 0.5
const STAGGER = 0.08

// data-reveal fades an element up. "left" or "right" slides it in from that side instead.
const startX = (element) => ({ left: -48, right: 48 })[element.getAttribute('data-reveal')] ?? 0
const startY = (element) => (startX(element) === 0 ? 16 : 0)

const shown = { opacity: 1, x: 0, y: 0, clearProps: 'opacity,transform' }

// Fades in every [data-reveal] element inside scopeRef (and the scope itself if it has the
// attribute) once, as it scrolls into view. Pass the loaded data as dependencies, so new
// results are revealed again.
export function useReveal(scopeRef, { dependencies = [] } = {}) {
  useGSAP(
    () => {
      const scope = scopeRef.current
      if (!scope) return

      gsap.matchMedia().add(MOTION_OK, () => {
        const targets = [
          ...(scope.matches('[data-reveal]') ? [scope] : []),
          ...scope.querySelectorAll('[data-reveal]'),
        ]

        // Sorted by where each one is now, so nothing can stay hidden: elements already
        // scrolled past are never hidden, ones on screen fade in now, the rest wait.
        const onScreen = []
        const below = []
        for (const element of targets) {
          const { top, bottom } = element.getBoundingClientRect()
          if (bottom <= 0) continue
          if (top < window.innerHeight) onScreen.push(element)
          else below.push(element)
        }

        if (onScreen.length > 0) {
          gsap.from(onScreen, {
            opacity: 0,
            x: (index, element) => startX(element),
            y: (index, element) => startY(element),
            duration: DURATION,
            ease: EASE,
            stagger: STAGGER,
            clearProps: 'opacity,transform',
          })
        }

        if (below.length === 0) return undefined

        gsap.set(below, {
          opacity: 0,
          x: (index, element) => startX(element),
          y: (index, element) => startY(element),
        })
        ScrollTrigger.batch(below, {
          start: 'top 90%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              ...shown,
              duration: DURATION,
              ease: EASE,
              stagger: STAGGER,
              overwrite: true,
            }),
        })

        // Tabbing to something that hasn't faded in yet shows it straight away, so focus
        // never lands on something invisible.
        function showFocused(event) {
          for (const element of below) {
            if (element.contains(event.target)) gsap.set(element, shown)
          }
        }
        scope.addEventListener('focusin', showFocused)
        return () => scope.removeEventListener('focusin', showFocused)
      })
    },
    { scope: scopeRef, dependencies, revertOnUpdate: true },
  )
}
