import { type ReactElement, type ReactNode } from 'react'
import { Index } from 'react-instantsearch'

import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../../libs/videoContext'
import {
  type CarouselMuxSlide,
  type VideoCarouselSlide
} from '../../../types/inserts'
import { ContentHeader } from '../../ContentHeader'
import { ContentPageBlurFilter } from '../../ContentPageBlurFilter'
import { VideoBlock } from '../../VideoBlock'
import { VideoCarousel } from '../../VideoCarousel'

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
  languageId?: string
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
  containerSlug = 'watch',
  languageId
}: ContainerWithMediaProps): ReactElement {
  const languageSlug = activeVideo?.slug?.split('/')[1]
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  return (
    <>
      <Index indexName={indexName}>
        <ContentHeader
          languageSlug={languageSlug?.replace('.html', '')}
          isPersistent={true}
          languageId={languageId}
        />
      </Index>
      {activeVideo != null && (
        <VideoProvider value={{ content: activeVideo }}>
          <VideoBlock
            placement="carouselItem"
            currentMuxInsert={currentMuxInsert}
            onMuxInsertComplete={onMuxInsertComplete}
            onSkipActiveVideo={onSkipActiveVideo}
          />
        </VideoProvider>
      )}
      <ContentPageBlurFilter>
        <div>
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
