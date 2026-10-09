import ExploreCategories from '../../components/home/ExploreCategories.jsx'
import HomeHero from '../../components/home/HomeHero.jsx'
import HowItWorks from '../../components/home/HowItWorks.jsx'
import PlatformStats from '../../components/home/PlatformStats.jsx'
import PopularCourses from '../../components/home/PopularCourses.jsx'
import SkillsStrip from '../../components/home/SkillsStrip.jsx'
import TeachBand from '../../components/home/TeachBand.jsx'
import WhatPeopleSay from '../../components/home/WhatPeopleSay.jsx'

// Each section loads its own data and handles its own loading, error and empty states.
function HomePage() {
  return (
    <>
      <HomeHero />
      <PlatformStats />
      <SkillsStrip />
      <PopularCourses />
      <ExploreCategories />
      <HowItWorks />
      <WhatPeopleSay />
      <TeachBand />
    </>
  )
}

export default HomePage
