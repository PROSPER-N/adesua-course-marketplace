import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

// Registered once here, so every animated component imports GSAP from this file.
gsap.registerPlugin(ScrollTrigger, SplitText)

// Animations are only built while this matches. With reduced motion nothing is hidden or moved,
// and switching it on mid-visit undoes any animation that's running.
export const MOTION_OK = '(prefers-reduced-motion: no-preference)'

export { gsap, ScrollTrigger, SplitText }
