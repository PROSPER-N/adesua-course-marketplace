import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePageVisible } from '../../hooks/usePageVisible.js'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'

// Full class names, so Tailwind finds them. The seam matches the gap, so the loop has no jump.
const GAPS = {
  sm: { gap: 'gap-3', seam: 'pr-3' },
  md: { gap: 'gap-5', seam: 'pr-5' },
}

// A row that moves slowly to the left on a loop. It pauses on hover, while something in it
// has keyboard focus, while the tab is hidden, and after a touch until the movement resumes.
// When everything fits, or with reduced motion, it wraps the pills onto several lines instead.
// header sits on the left above the row; actions sit on the right.
// While the items load, placeholder shows in the row's place.
function AutoScroller({
  items,
  getKey,
  renderItem,
  speed = 30,
  gap = 'md',
  header,
  actions,
  rowClassName = 'mt-6',
  placeholder,
}) {
  const reducedMotion = useReducedMotion()
  const pageVisible = usePageVisible()
  const [paused, setPaused] = useState(false)
  const [size, setSize] = useState({ fits: false, width: 0 })
  const boxRef = useRef(null)
  const listRef = useRef(null)
  const pauseTimerRef = useRef(null)
  const moving = !placeholder && !reducedMotion && !size.fits
  const { gap: gapClass, seam } = GAPS[gap] ?? GAPS.md

  // The header's content width is the room the row has. Measured before the first paint, so
  // a row that fits never starts moving.
  useLayoutEffect(() => {
    const box = boxRef.current
    const list = listRef.current
    if (!box || !list) return undefined

    function measure() {
      const boxStyle = getComputedStyle(box)
      const listStyle = getComputedStyle(list)
      const room =
        box.clientWidth - parseFloat(boxStyle.paddingLeft) - parseFloat(boxStyle.paddingRight)
      const content =
        list.scrollWidth - parseFloat(listStyle.paddingLeft) - parseFloat(listStyle.paddingRight)
      setSize({ fits: content <= room, width: list.offsetWidth })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    observer.observe(list)
    return () => observer.disconnect()
  }, [items, moving])

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    }
  }, [])

  const itemList = (copy) => (
    <ul
      aria-hidden={copy || undefined}
      className={`flex ${moving ? 'w-max shrink-0' : 'w-full flex-wrap'} ${gapClass} ${moving ? seam : ''}`}
      // The copy only makes the loop seamless, so screen readers and Tab skip it.
      inert={copy || undefined}
      key={copy ? 'copy' : 'items'}
      ref={copy ? undefined : listRef}
    >
      {items.map((item) => (
        <li className={`flex shrink-0 ${moving ? '' : 'snap-start'}`} key={getKey(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  )

  let row
  if (placeholder) {
    row = (
      <div
        aria-hidden="true"
        className={`mx-auto max-w-7xl overflow-hidden px-4 py-2 sm:px-6 lg:px-8 ${rowClassName}`}
      >
        {placeholder}
      </div>
    )
  } else if (moving) {
    // The edges fade out, so items slide in and out of view instead of being cut off.
    row = (
      <div
        className={`auto-scroller hide-scrollbar relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] ${rowClassName}`}
        data-paused={paused || !pageVisible || undefined}
        onPointerDown={(event) => {
          if (event.pointerType === 'touch') {
            setPaused(true)
            if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
            pauseTimerRef.current = setTimeout(() => setPaused(false), 8000)
          }
        }}
        style={{ '--auto-scroll-duration': `${Math.max(size.width / speed, 1)}s` }}
      >
        <div className="auto-scroller-track flex w-max">
          {itemList(false)}
          {itemList(true)}
        </div>
      </div>
    )
  } else {
    row = (
      <div
        className={`hide-scrollbar relative mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8 ${rowClassName}`}
      >
        {itemList(false)}
      </div>
    )
  }

  return (
    <div>
      <div
        className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 sm:px-6 lg:px-8"
        ref={boxRef}
      >
        {header}
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {row}
    </div>
  )
}

export default AutoScroller
