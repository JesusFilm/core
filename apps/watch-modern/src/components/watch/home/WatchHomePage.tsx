import type { ReactElement } from 'react'

import { AboutSection } from './About'
import { HomeHero } from './HomeHero'
import { SeeAllVideos } from './SeeAllVideos'
import { VideoGrid } from './VideoGrid'

export default function WatchHomePage(): ReactElement {
  return (
    <>
      {/* Hero with overlay */}
      <HomeHero />
      {/* CTA to jump to videos */}
      <SeeAllVideos />
      {/* About block */}
      <AboutSection />
      {/* Search + Grid */}
      <VideoGrid />
    </>
  )
}
