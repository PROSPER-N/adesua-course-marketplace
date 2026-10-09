import { useGSAP } from '@gsap/react'
import { Check } from 'lucide-react'
import { useRef } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useReveal } from '../../hooks/useReveal.js'
import { gsap, MOTION_OK } from '../../utils/gsap.js'
import Button from '../ui/Button.jsx'

const TEACHING_BENEFITS = [
  'Free to start teaching',
  'See your students and earnings',
  "Publish when you're ready",
]

// A designer filming a tutorial (credits in docs/CREDITS.md), from the Pexels CDN.
const PHOTO = 'https://images.pexels.com/photos/36731347/pexels-photo-36731347.jpeg'
const photoUrl = (width) => `${PHOTO}?auto=compress&cs=tinysrgb&w=${width}`

function TeachBand() {
  const { user, loading } = useAuth()
  const sectionRef = useRef(null)
  const photoRef = useRef(null)
  // Wait until a saved login is checked, so a student never sees the guest version flash.
  const shown = !loading && (!user || user.role === 'instructor')

  useReveal(sectionRef, { dependencies: [shown] })

  // The photo drifts a little slower than the page as it scrolls past. It's 8% taller than the
  // band and moves 3.7% of its height each way (about 4% of the band), so an edge never shows.
  // Only from 768px: on phones the band is short and the effect would barely show.
  useGSAP(
    () => {
      if (!shown) return
      gsap.matchMedia().add(`(min-width: 768px) and ${MOTION_OK}`, () => {
        gsap.fromTo(
          photoRef.current,
          { yPercent: -3.7 },
          {
            yPercent: 3.7,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      })
    },
    { scope: sectionRef, dependencies: [shown], revertOnUpdate: true },
  )

  if (!shown) return null

  const isInstructor = user?.role === 'instructor'

  return (
    <section
      aria-labelledby="teach-heading"
      className="relative isolate overflow-hidden bg-night"
      ref={sectionRef}
    >
      {/* Decorative. object-position keeps the designer in view on the right. */}
      <img
        alt=""
        className="absolute inset-x-0 -top-[4%] -z-20 h-[108%] w-full object-cover object-[70%_center]"
        decoding="async"
        loading="lazy"
        ref={photoRef}
        sizes="100vw"
        src={photoUrl(1600)}
        srcSet={`${photoUrl(800)} 800w, ${photoUrl(1600)} 1600w`}
      />
      {/* At least 70% dark under the text, so white text passes AA over any part of the photo. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-night/70 lg:bg-transparent lg:bg-linear-to-r lg:from-night/90 lg:via-night/70 lg:via-55% lg:to-night/30"
      />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-xl" data-reveal="">
          <h2 className="font-serif text-headline font-semibold text-white" id="teach-heading">
            Teach what you know
          </h2>
          <p className="mt-4 text-lg text-white/85">
            Turn your skills into short video lessons, and earn when learners buy your course.
          </p>
          <ul className="mt-6 grid gap-2.5">
            {TEACHING_BENEFITS.map((label) => (
              <li className="flex items-center gap-2.5 text-white/90" key={label}>
                <Check aria-hidden="true" className="size-4 shrink-0 text-gold" />
                {label}
              </li>
            ))}
          </ul>
          {/* The Button's usual green focus ring would vanish on the dark band, so this one is gold. */}
          <Button
            className="mt-8 focus-visible:outline-gold!"
            to={isInstructor ? '/instructor' : '/register?role=instructor'}
            variant="gold"
          >
            {isInstructor ? 'Go to your dashboard' : 'Start teaching'}
          </Button>
        </div>
      </div>
    </section>
  )
}

export default TeachBand
