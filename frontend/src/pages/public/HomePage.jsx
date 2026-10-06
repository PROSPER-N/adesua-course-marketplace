import { useEffect, useState } from 'react'
import { getCategories } from '../../api/categories.js'
import CategoryChips from '../../components/home/CategoryChips.jsx'
import HomeHero from '../../components/home/HomeHero.jsx'
import HowItWorks from '../../components/home/HowItWorks.jsx'
import PlatformStats from '../../components/home/PlatformStats.jsx'
import PopularCourses from '../../components/home/PopularCourses.jsx'
import SkillsStrip from '../../components/home/SkillsStrip.jsx'
import TeachBand from '../../components/home/TeachBand.jsx'

function HomePage() {
  // Each load or retry is a new attempt. A result remembers the attempt it answers,
  // so the page is loading until the latest attempt has its result.
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ attempt: -1, categories: [], error: null })
  const loading = result.attempt !== attempt

  useEffect(() => {
    let ignore = false
    getCategories()
      .then((categories) => {
        if (!ignore) setResult({ attempt, categories, error: null })
      })
      .catch((error) => {
        if (!ignore) setResult({ attempt, categories: [], error })
      })

    return () => {
      ignore = true
    }
  }, [attempt])

  return (
    <>
      <HomeHero categories={result.categories} loading={loading} />
      <PlatformStats />
      <SkillsStrip />
      <CategoryChips
        categories={result.categories}
        error={loading ? null : result.error}
        loading={loading}
        onRetry={() => setAttempt((current) => current + 1)}
      />
      <PopularCourses />
      <HowItWorks />
      <TeachBand />
    </>
  )
}

export default HomePage
