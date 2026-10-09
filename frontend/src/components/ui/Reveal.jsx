import { useRef } from 'react'
import { useReveal } from '../../hooks/useReveal.js'

// One block, such as a section heading, that fades in as it scrolls into view.
function Reveal({ as: Tag = 'div', children, ...props }) {
  const ref = useRef(null)
  useReveal(ref)

  return (
    <Tag data-reveal="" ref={ref} {...props}>
      {children}
    </Tag>
  )
}

export default Reveal
