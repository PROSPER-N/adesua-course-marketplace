import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { usePageVisible } from '../../hooks/usePageVisible.js'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'

const ROW_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown']
const RESUME_DELAY_MS = 8000

function AutoStepRow({
  actions,
  getKey,
  header,
  itemClassName,
  items,
  label,
  placeholder,
  renderItem,
  rowClassName = '',
}) {
  const rowRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [onScreen, setOnScreen] = useState(false)
  const [paused, setPaused] = useState(false)
  const [edges, setEdges] = useState({ atStart: true, atEnd: true })
  const reducedMotion = useReducedMotion()
  const pageVisible = usePageVisible()
  const resumeTimerRef = useRef(null)

  const pauseForInteraction = () => {
    setPaused(true)
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => setPaused(false), RESUME_DELAY_MS)
  }

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    }
  }, [])

  function updateEdges() {
    const row = rowRef.current
    if (!row) return

    setEdges({
      atStart: row.scrollLeft <= 1,
      atEnd: row.scrollLeft + row.clientWidth >= row.scrollWidth - 1,
    })
  }

  useEffect(() => {
    const row = rowRef.current
    if (!row) return undefined

    const observer = new ResizeObserver(updateEdges)
    observer.observe(row)
    return () => observer.disconnect()
  }, [items.length, placeholder])

  useEffect(() => {
    const row = rowRef.current
    if (!row) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.intersectionRatio >= 0.5),
      { threshold: [0, 0.5, 1] },
    )
    observer.observe(row)
    return () => observer.disconnect()
  }, [items.length, placeholder])

  const overflows = !(edges.atStart && edges.atEnd)
  const canAutoStep =
    !reducedMotion && !paused && onScreen && pageVisible && !hovered && !focused && overflows

  useEffect(() => {
    if (!canAutoStep || placeholder) return undefined

    const timer = setInterval(() => {
      const row = rowRef.current
      if (!row || !row.children.length) return

      const [first, second] = row.children
      if (row.scrollLeft + row.clientWidth >= row.scrollWidth - 1) {
        row.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        row.scrollBy({ left: second.offsetLeft - first.offsetLeft, behavior: 'smooth' })
      }
    }, 5000)

    return () => clearInterval(timer)
  }, [canAutoStep, placeholder])

  function scrollToStep(direction) {
    const row = rowRef.current
    if (!row || !row.children.length) return

    pauseForInteraction()

    const first = row.children[0]
    const second = row.children[1]
    const step = second ? second.offsetLeft - first.offsetLeft : row.clientWidth * 0.85

    if (direction === 1 && row.scrollLeft + row.clientWidth >= row.scrollWidth - 1) {
      row.scrollTo({ left: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
      return
    }

    if (direction === -1 && row.scrollLeft <= 1) {
      row.scrollTo({ left: row.scrollWidth, behavior: reducedMotion ? 'auto' : 'smooth' })
      return
    }

    row.scrollBy({ left: step * direction, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  if (placeholder) {
    return (
      <div>
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {header}
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
        <div
          className={`mx-auto max-w-7xl overflow-hidden px-4 py-2 sm:px-6 lg:px-8 ${rowClassName}`}
        >
          {placeholder}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {header}
        <div className="flex items-center gap-3">
          {actions}
          <div className="hidden gap-2 md:flex">
            <button
              aria-label={`Scroll back through the ${label}`}
              className="inline-flex size-10 items-center justify-center rounded-full border border-field text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
              disabled={edges.atStart}
              onClick={() => scrollToStep(-1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
            <button
              aria-label={`Scroll forward through the ${label}`}
              className="inline-flex size-10 items-center justify-center rounded-full border border-field text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
              disabled={edges.atEnd}
              onClick={() => scrollToStep(1)}
              type="button"
            >
              <ChevronRight aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <ul
        className={`hide-scrollbar relative -mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto scroll-smooth px-4 pb-4 motion-reduce:scroll-auto sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8 ${rowClassName}`}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
        }}
        onFocus={() => setFocused(true)}
        onKeyDown={(event) => {
          if (ROW_KEYS.includes(event.key)) pauseForInteraction()
        }}
        onPointerDown={(event) => {
          if (event.pointerType === 'touch') pauseForInteraction()
        }}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') setHovered(true)
        }}
        onPointerLeave={() => setHovered(false)}
        onScroll={updateEdges}
        onWheel={(event) => {
          if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) pauseForInteraction()
        }}
        ref={rowRef}
        role="list"
      >
        {items.map((item) => (
          <li className={itemClassName} key={getKey(item)}>
            {renderItem(item)}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AutoStepRow
