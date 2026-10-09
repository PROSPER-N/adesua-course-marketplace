import { Pause, Play } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { usePageVisible } from '../../hooks/usePageVisible.js'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'

// Full class names, so Tailwind finds them. The seam matches the gap, so the loop has no jump.
const GAPS = {
  sm: { gap: 'gap-3', seam: 'pr-3' },
  md: { gap: 'gap-5', seam: 'pr-5' },
}

const PAUSE_CLASS =
  'inline-flex size-11 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

// A row that moves slowly to the left on a loop. It pauses on hover, while something in it
// has keyboard focus, while the tab is hidden, and after a touch until Play is pressed.
// When everything fits, or with reduced motion, it's a still row that can be swiped instead.
// header sits on the left above the row; actions and the Pause button sit on the right.
function AutoScroller({
  items,
  getKey,
  renderItem,
  label,
  speed = 30,
  gap = 'md',
  header,
  actions,
  rowClassName = 'mt-6',
}) {
  const reducedMotion = useReducedMotion()
  const pageVisible = usePageVisible()
  const [paused, setPaused] = useState(false)
  const [size, setSize] = useState({ fits: false, width: 0 })
  const boxRef = useRef(null)
  const listRef = useRef(null)
  const moving = !reducedMotion && !size.fits
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

  const itemList = (copy) => (
    <ul
      aria-hidden={copy || undefined}
      className={`flex w-max shrink-0 ${gapClass} ${moving ? seam : ''}`}
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

  return (
    <div>
      <div
        className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 sm:px-6 lg:px-8"
        ref={boxRef}
      >
        {header}
        <div className="flex items-center gap-3">
          {actions}
          {moving && (
            <button
              aria-label={paused ? `Play the ${label}` : `Pause the ${label}`}
              className={PAUSE_CLASS}
              onClick={() => setPaused((current) => !current)}
              type="button"
            >
              {paused ? (
                <Play aria-hidden="true" className="size-5" />
              ) : (
                <Pause aria-hidden="true" className="size-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {moving ? (
        // The edges fade out, so items slide in and out of view instead of being cut off.
        <div
          className={`auto-scroller relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] ${rowClassName}`}
          data-paused={paused || !pageVisible || undefined}
          onPointerDown={(event) => {
            if (event.pointerType === 'touch') setPaused(true)
          }}
          style={{ '--auto-scroll-duration': `${Math.max(size.width / speed, 1)}s` }}
        >
          <div className="auto-scroller-track flex w-max">
            {itemList(false)}
            {itemList(true)}
          </div>
        </div>
      ) : (
        <div
          className={`relative mx-auto max-w-7xl snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 py-2 sm:scroll-px-6 sm:px-6 lg:scroll-px-8 lg:px-8 ${rowClassName}`}
        >
          {itemList(false)}
        </div>
      )}
    </div>
  )
}

export default AutoScroller
