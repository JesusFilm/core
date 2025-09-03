import type { ReactElement } from 'react'

import { AboutSection } from './About'
import { HomeHero } from './HomeHero'
import { VideoGrid } from './VideoGrid'

export default function WatchHomePage(): ReactElement {
  return (
    <>
      {/* Hero with overlay */}
      <HomeHero />
      {/* Search + Grid (directly below hero, no CTA section) */}
      <VideoGrid />
      {/* About block */}
      <AboutSection />
    </>
  )
}
