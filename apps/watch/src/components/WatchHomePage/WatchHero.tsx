import { type ReactElement, type ReactNode } from 'react'

import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../libs/videoContext'
import {
  type CarouselMuxSlide,
  type VideoCarouselSlide
} from '../../types/inserts'
import { ContentPageBlurFilter } from '../NewVideoContentPage/ContentPageBlurFilter'
import { VideoCarousel } from '../NewVideoContentPage/VideoCarousel/VideoCarousel'
import { VideoContentHero } from '../NewVideoContentPage/VideoContentHero/VideoContentHero'

interface WatchHeroProps {
  slides: VideoCarouselSlide[]
  activeVideoId?: string
  activeVideo: VideoContentFields | null
  currentMuxInsert: CarouselMuxSlide | null
  loading: boolean
  onSelectSlide: (slideId: string) => void
  onMuxInsertComplete: () => void
  children?: ReactNode
}

export function WatchHero({
  slides,
  activeVideoId,
  activeVideo,
  currentMuxInsert,
  loading,
  onSelectSlide,
  onMuxInsertComplete,
  children
}: WatchHeroProps): ReactElement {
  return (
    <>
      {activeVideo != null && (
        <VideoProvider value={{ content: activeVideo }}>
          <VideoContentHero
            isPreview
            currentMuxInsert={currentMuxInsert}
            onMuxInsertComplete={onMuxInsertComplete}
          />
        </VideoProvider>
      )}
      <ContentPageBlurFilter>
        <div className="pt-4">
          <VideoCarousel
            slides={slides}
            activeVideoId={activeVideoId}
            loading={loading}
            onVideoSelect={onSelectSlide}
          />
        </div>
        {children}
      </ContentPageBlurFilter>
    </>
  )
}
