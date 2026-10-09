import { useGSAP } from '@gsap/react'
import { ArrowRight, Check } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router'
import FeaturedInstructors from '../../components/about/FeaturedInstructors.jsx'
import PlatformStats from '../../components/home/PlatformStats.jsx'
import Button from '../../components/ui/Button.jsx'
import Reveal from '../../components/ui/Reveal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useReveal } from '../../hooks/useReveal.js'
import { gsap, MOTION_OK } from '../../utils/gsap.js'

const HERO_PHOTO = 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg'

const AUDIENCES = [
  {
    title: 'For learners',
    items: [
      'Preview the lessons before you enroll or buy.',
      'Learn from short courses at your own pace.',
      'Keep your courses and progress together in My learning.',
    ],
  },
  {
    title: 'For instructors',
    items: [
      'Build courses from video lessons and notes.',
      'Keep a course as a draft until it is ready to publish.',
      'See your students and earnings in the instructor dashboard.',
    ],
  },
]

const PRINCIPLES = [
  { number: '01', title: 'See the whole course first.' },
  { number: '02', title: 'Progress that follows you.' },
  { number: '03', title: 'Instructors run their own courses.' },
]

const TEAM = [
  { name: 'Prosper Ngwoke', role: 'Full-stack developer · Project lead' },
  { name: 'Folakemi Elizabeth Okeowo', role: 'Full-stack developer · Courses' },
  { name: 'Victor C.U Benneth', role: 'Full-stack developer · Learning' },
]

function AboutPage() {
  const { user, loading } = useAuth()
  const pageRef = useRef(null)
  const heroRef = useRef(null)
  const heroPhotoRef = useRef(null)

  useReveal(pageRef)

  useGSAP(
    () => {
      gsap.matchMedia().add(`(min-width: 768px) and ${MOTION_OK}`, () => {
        gsap.fromTo(
          heroPhotoRef.current,
          { yPercent: -3.7 },
          {
            yPercent: 3.7,
            ease: 'none',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      })
    },
    { scope: heroRef, revertOnUpdate: true },
  )

  const isGuest = !loading && !user
  const isInstructor = !loading && user?.role === 'instructor'

  return (
    <div ref={pageRef}>
      <section
        aria-labelledby="about-heading"
        className="relative isolate flex min-h-[28rem] items-end overflow-hidden bg-night md:min-h-[34rem]"
        ref={heroRef}
      >
        <img
          alt=""
          className="absolute inset-x-0 -top-[4%] -z-20 h-[108%] w-full object-cover object-center"
          decoding="async"
          fetchPriority="high"
          ref={heroPhotoRef}
          sizes="100vw"
          src={`${HERO_PHOTO}?auto=compress&cs=tinysrgb&w=1600`}
          srcSet={`${HERO_PHOTO}?auto=compress&cs=tinysrgb&w=800 800w, ${HERO_PHOTO}?auto=compress&cs=tinysrgb&w=1600 1600w`}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-night/75 lg:bg-linear-to-r lg:from-night/90 lg:via-night/75 lg:via-60% lg:to-night/30"
        />
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl text-white">
            <p
              className="text-xs font-semibold tracking-[0.14em] text-gold uppercase"
              data-reveal=""
            >
              About Adesua
            </p>
            <Reveal
              as="h1"
              className="mt-4 font-serif text-headline font-semibold sm:text-display"
              id="about-heading"
            >
              Adesua means learning.
            </Reveal>
            <p className="mt-4 max-w-2xl text-lg text-white/85" data-reveal="">
              It’s a video course marketplace: instructors publish courses, and learners enroll,
              watch the lessons and track their progress.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-20">
        <div data-reveal="">
          <p className="text-xs font-semibold tracking-[0.12em] text-brand uppercase">
            What Adesua is
          </p>
          <h2 className="mt-3 font-serif text-display font-medium text-ink">
            Practical learning, built around real courses.
          </h2>
          <p className="mt-5 text-muted">
            Instructors create courses from video lessons and notes. Learners can explore the full
            outline before enrolling, work through lessons at their own pace and keep track of what
            they’ve completed.
          </p>
          <p className="mt-3 text-muted">
            Checkout is a demo. It doesn’t take real payments, and prices are shown before you
            choose to buy.
          </p>
          <Link
            className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-dark hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            to="/help"
          >
            Learn how Adesua works
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="relative min-h-72 overflow-hidden rounded-2xl bg-surface md:min-h-96">
          <img
            alt=""
            className="absolute inset-0 size-full object-cover"
            decoding="async"
            loading="lazy"
            sizes="(min-width: 768px) 50vw, 100vw"
            src="/media/hero-poster.jpg"
          />
        </div>
      </section>

      <PlatformStats />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-20">
        {AUDIENCES.map(({ title, items }) => (
          <div key={title}>
            <Reveal
              as="h2"
              className="font-serif text-title font-semibold text-ink sm:text-display"
            >
              {title}
            </Reveal>
            <ul className="mt-5 grid gap-4">
              {items.map((item) => (
                <li className="flex items-start gap-3 text-muted" key={item}>
                  <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FeaturedInstructors />
      </div>

      <section
        aria-labelledby="values-heading"
        className="bg-surface px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal
            as="h2"
            className="font-serif text-display font-medium text-ink"
            id="values-heading"
          >
            What we care about
          </Reveal>
          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {PRINCIPLES.map(({ number, title }) => (
              <li className="border-t border-line pt-5" key={number} data-reveal="">
                <span aria-hidden="true" className="font-serif text-numeral text-brand">
                  {number}
                </span>
                <h3 className="mt-3 font-serif text-title font-semibold text-ink">{title}</h3>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="team-heading"
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      >
        <Reveal as="h2" className="font-serif text-display font-medium text-ink" id="team-heading">
          The team
        </Reveal>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map(({ name, role }) => (
            <li className="rounded-xl border border-line bg-card p-5" key={name} data-reveal="">
              <p className="font-serif text-title font-semibold text-ink">{name}</p>
              <p className="mt-1 text-sm text-muted">{role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-night px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-title font-semibold sm:text-display">
              Find your next course.
            </h2>
            <p className="mt-2 text-white/75">Learn something useful or share what you know.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button to="/courses" variant="gold">
              Browse courses
            </Button>
            {isGuest && (
              <Button
                className="focus-visible:outline-gold!"
                to="/register?role=instructor"
                variant="outline"
              >
                Start teaching
              </Button>
            )}
            {isInstructor && (
              <Button className="focus-visible:outline-gold!" to="/instructor" variant="outline">
                Go to your dashboard
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
