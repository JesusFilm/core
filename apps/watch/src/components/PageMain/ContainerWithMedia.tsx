import { type ReactElement, type ReactNode } from 'react'

import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../libs/videoContext'
import {
  type CarouselMuxSlide,
  type VideoCarouselSlide
} from '../../types/inserts'
import { ContentPageBlurFilter } from '../ContentPageBlurFilter'
import { VideoCarousel } from '../VideoCarousel/VideoCarousel'
import { VideoBlock } from '../VideoBlock/VideoBlock'

interface ContainerWithMediaProps {
  slides: VideoCarouselSlide[]
  activeVideoId?: string
  activeVideo: VideoContentFields | null
  currentMuxInsert: CarouselMuxSlide | null
  loading: boolean
  onSelectSlide: (slideId: string) => void
  onMuxInsertComplete: () => void
  onSkipActiveVideo?: () => void
  children?: ReactNode
  containerSlug?: string
}

export function ContainerWithMedia({
  slides,
  activeVideoId,
  activeVideo,
  currentMuxInsert,
  loading,
  onSelectSlide,
  onMuxInsertComplete,
  onSkipActiveVideo,
  children,
  containerSlug = 'watch'
}: ContainerWithMediaProps): ReactElement {
  return (
    <>
      {activeVideo != null && (
        <VideoProvider value={{ content: activeVideo }}>
          <VideoBlock
            isPreview
            placement="carouselItem"
            currentMuxInsert={currentMuxInsert}
            onMuxInsertComplete={onMuxInsertComplete}
            onSkipActiveVideo={onSkipActiveVideo}
          />
        </VideoProvider>
      )}
      <ContentPageBlurFilter>
        <div className="py-5 ">
          <VideoCarousel
            slides={slides}
            containerSlug={containerSlug}
            activeVideoId={activeVideoId ?? ''}
            loading={loading}
            onVideoSelect={onSelectSlide}
          />
        </div>
        {children}
      </ContentPageBlurFilter>
    </>
  )
}
