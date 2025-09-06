import type { ReactElement } from 'react'

import { AboutSection } from './About'
import { HomeHero } from './HomeHero'

export default function WatchHomePage(): ReactElement {
  return (
    <>
      {/* Hero with overlay */}
      <HomeHero />
      {/* Grid removed from page; shown in overlay via Header */}
      {/* About block */}
      <AboutSection />
    </>
  )
}
