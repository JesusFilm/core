import { type ReactElement, type ReactNode } from 'react'

import { VideoProvider } from '../../libs/videoContext'
import { useVideoCarousel } from '../../libs/videoCarouselContext'
import { VideoContentHero } from '../NewVideoContentPage/VideoContentHero/VideoContentHero'
import { VideoCarouselSection } from '../FeaturedVideo/VideoCarouselSection'

interface WatchHeroProps {
  children?: ReactNode
}

export function WatchHero({ children }: WatchHeroProps): ReactElement {
  const { activeVideo, currentMuxInsert, handleMuxInsertComplete, handleSkipActiveVideo } = useVideoCarousel()

  return (
    <>
      {activeVideo != null && (
        <VideoProvider value={{ content: activeVideo }}>
          <VideoContentHero
            isPreview
            currentMuxInsert={currentMuxInsert}
            onMuxInsertComplete={handleMuxInsertComplete}
            onSkipActiveVideo={handleSkipActiveVideo}
          />
        </VideoProvider>
      )}
      <VideoCarouselSection>
        {children}
      </VideoCarouselSection>
    </>
  )
}
