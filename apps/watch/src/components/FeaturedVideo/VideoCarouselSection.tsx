import { type ReactNode } from 'react'

import { ContentPageBlurFilter } from '../NewVideoContentPage/ContentPageBlurFilter'
import { VideoCarousel } from '../NewVideoContentPage/VideoCarousel/VideoCarousel'

interface VideoCarouselSectionProps {
  children?: ReactNode
}

export function VideoCarouselSection({ children }: VideoCarouselSectionProps) {
  return (
    <ContentPageBlurFilter>
      <div className="pt-4">
        <VideoCarousel />
      </div>
      {children}
    </ContentPageBlurFilter>
  )
}

