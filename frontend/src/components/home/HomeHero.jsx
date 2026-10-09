import { useGSAP } from '@gsap/react'
import { Pause, Play, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { gsap, MOTION_OK, SplitText } from '../../utils/gsap.js'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'

const POPULAR_SEARCHES = ['React', 'Excel', 'Bookkeeping', 'Photography']

const POSTER = '/media/hero-poster.jpg'

// The learner sits right of centre in the clip. On phones the picture is a band above the text,
// shifted so she's in the middle. From 768px it fills the hero behind the text, shifted further
// right on tablets so the text column doesn't cover her.
const MEDIA_CLASS =
  'relative -z-20 block h-80 w-full object-cover object-right md:absolute md:inset-0 md:h-full md:object-[30%_center] lg:object-center'

// Checked once. The clip plays on every screen size, but never with reduced motion or Data
// Saver: then the poster shows and no video is downloaded.
function videoAllowed() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const saveData = navigator.connection?.saveData === true
  return !reducedMotion && !saveData
}

// The headline intro plays once per page load: the first time Home shows, not on coming back.
let introPlayed = false

// Waits for the serif to load, so the lines are split where they will really break. A slow
// font doesn't hold the page up: after half a second it splits anyway, and autoSplit splits
// again once the font arrives.
const fontsOrTimeout = () =>
  Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 500))])

function HomeHero() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showVideo] = useState(videoAllowed)
  // Follows the video's own play and pause events, so the button is right even if autoplay is blocked.
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef(null)
  const textRef = useRef(null)

  // Phones only autoplay muted, inline video. React sets muted as a property but not as an
  // attribute, which some phone browsers check, so set both here and start playback.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.defaultMuted = true
    video.setAttribute('muted', '')
    video.play().catch(() => {})
  }, [])

  // The headline rises line by line, then the text, search and links under it fade up.
  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, (context) => {
        if (introPlayed) return undefined
        const [heading, ...rest] = textRef.current.children
        let cancelled = false

        // Hidden before the first paint. visibility keeps each box, so nothing below moves.
        gsap.set([heading, ...rest], { autoAlpha: 0 })

        fontsOrTimeout().then(() => {
          if (cancelled) return
          // Added to the context, so leaving the page or turning on reduced motion undoes it.
          context.add(() => {
            // aria: auto reads the whole sentence to screen readers while the lines are split.
            const split = SplitText.create(heading, {
              type: 'lines',
              mask: 'lines',
              linesClass: 'hero-line',
              aria: 'auto',
              autoSplit: true,
              // A new split (after a late font or a resize) keeps the animation's place.
              onSplit: (self) => {
                gsap.set(heading, { autoAlpha: 1 })
                return gsap.from(self.lines, {
                  yPercent: 115,
                  duration: 0.9,
                  stagger: 0.12,
                  ease: 'power3.out',
                })
              },
            })

            gsap.fromTo(
              rest,
              { autoAlpha: 0, y: 16 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: 'power2.out',
                delay: 0.6 + 0.12 * (split.lines.length - 1),
                // Back to plain text and no inline styles once it has played.
                onComplete: () => {
                  introPlayed = true
                  split.revert()
                  gsap.set([heading, ...rest], { clearProps: 'opacity,visibility,transform' })
                },
              },
            )
          })
        })

        return () => {
          cancelled = true
        }
      })
    },
    { scope: textRef },
  )

  function handleSubmit(event) {
    event.preventDefault()
    const text = search.trim()
    navigate(text ? `/courses?search=${encodeURIComponent(text)}` : '/courses')
  }

  function togglePlayback() {
    const video = videoRef.current
    if (video.paused) video.play().catch(() => {})
    else video.pause()
  }

  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden bg-night">
      {/* Decorative: the headline says what the page is about. */}
      {showVideo ? (
        <video
          aria-hidden="true"
          autoPlay
          className={MEDIA_CLASS}
          loop
          muted
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          playsInline
          poster={POSTER}
          preload="metadata"
          ref={videoRef}
          tabIndex={-1}
        >
          <source src="/media/hero.webm" type="video/webm" />
          <source src="/media/hero.mp4" type="video/mp4" />
        </video>
      ) : (
        <img alt="" className={MEDIA_CLASS} decoding="async" fetchPriority="high" src={POSTER} />
      )}

      {/* Phones: the picture fades into the dark background the text sits on. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-80 bg-linear-to-b from-transparent from-50% to-night md:hidden"
      />
      {/* From 768px: at least 70% dark under all the text, so white text passes AA even over a
          white frame. From lg the text keeps to the left, so the right side shows more of the clip. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden bg-night/70 md:block lg:bg-transparent lg:bg-linear-to-r lg:from-night/85 lg:via-night/70 lg:via-60% lg:to-night/30"
      />

      {/* On phones the Pause button sits below the text, so the text ends higher up there. */}
      <div className="mx-auto -mt-8 flex max-w-7xl flex-col justify-end px-4 pb-20 sm:px-6 md:mt-0 md:min-h-[40rem] md:pt-20 md:pb-12 lg:min-h-[min(88svh,46rem)] lg:px-8 lg:pb-20">
        <div className="max-w-xl md:max-w-md lg:max-w-xl" ref={textRef}>
          <h1 className="font-serif text-hero font-semibold text-white" id="hero-heading">
            Learn something useful on your lunch break.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-white/85">
            Video courses in coding, design, business, marketing and photography. Most lessons take
            30 minutes or less, and when you finish one on your laptop, the next one is waiting on
            your phone.
          </p>

          <form
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            onSubmit={handleSubmit}
            role="search"
          >
            <div className="flex-1">
              {/* Gold focus rings, because the usual green one is too faint on the dark overlay. */}
              <Input
                aria-label="Search courses"
                className="focus-visible:outline-gold!"
                name="search"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="What do you want to learn?"
                type="search"
                value={search}
              />
            </div>
            <Button className="focus-visible:outline-gold!" type="submit" variant="gold">
              <Search aria-hidden="true" className="size-4" />
              Search
            </Button>
          </form>

          <p className="mt-5 text-sm text-white/85">
            Popular:{' '}
            {POPULAR_SEARCHES.map((word, index) => (
              <span key={word}>
                {index > 0 && ', '}
                <Link
                  className="rounded-sm font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  to={`/courses?search=${encodeURIComponent(word)}`}
                >
                  {word}
                </Link>
              </span>
            ))}
          </p>
        </div>
      </div>

      {showVideo && (
        <button
          aria-label={playing ? 'Pause the background video' : 'Play the background video'}
          className="absolute right-4 bottom-4 inline-flex size-11 items-center justify-center rounded-full bg-night/60 text-white ring-1 ring-white/40 hover:bg-night/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:right-6 lg:right-8"
          onClick={togglePlayback}
          type="button"
        >
          {playing ? (
            <Pause aria-hidden="true" className="size-5" />
          ) : (
            <Play aria-hidden="true" className="size-5" />
          )}
        </button>
      )}
    </section>
  )
}

export default HomeHero
