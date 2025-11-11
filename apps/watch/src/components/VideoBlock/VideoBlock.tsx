import clsx from 'clsx'
import { ReactElement, useCallback, useEffect, useState } from 'react'

import { usePlayer } from '../../libs/playerContext/PlayerContext'
import { useVideo } from '../../libs/videoContext/VideoContext'
import type { CarouselMuxSlide } from '../../types/inserts'

import { ContentHeader } from '../ContentHeader'
import { VideoBlockPlayer } from './VideoBlockPlayer'

export function VideoBlock({
  isPreview = false,
  placement = 'singleVideo',
  currentMuxInsert,
  onMuxInsertComplete,
  onSkipActiveVideo
}: {
  isPreview?: boolean
  placement?: 'carouselItem' | 'singleVideo'
  currentMuxInsert?: CarouselMuxSlide | null
  onMuxInsertComplete?: () => void
  onSkipActiveVideo?: () => void
}): ReactElement {
  const { variant } = useVideo()
  const {
    state: { mute }
  } = usePlayer()
  const [collapsed, setCollapsed] = useState(mute)
  const [wasUnmuted, setWasUnmuted] = useState(false)

  const languageSlug = variant?.slug?.split('/')[1]

  // Sync collapsed state with mute state
  useEffect(() => {
    setCollapsed(mute)
  }, [mute])

  const handleMuteToggle = useCallback(
    (isMuted: boolean): void => {
      setCollapsed(isMuted)
      // Track if video was unmuted at least once on single page
      if (placement === 'singleVideo' && !isMuted) {
        setWasUnmuted(true)
      }
    },
    [placement]
  )

  const isExpanded = placement == 'singleVideo' || !collapsed
  const aspectRatioClass = isExpanded
    ? 'aspect-[var(--ratio-sm-expanded)] md:aspect-[var(--ratio-md-expanded)]'
    : 'aspect-[var(--ratio-sm)] md:aspect-[var(--ratio-md)]'

  return (
    <div
      className={clsx(
        'w-full flex items-end relative bg-[#000] z-[1] transition-all duration-300 ease-out overflow-hidden',
        {
          'aspect-[var(--ratio-sm)] md:aspect-[var(--ratio-md)]':
            placement == 'carouselItem' && collapsed,
          'aspect-[var(--ratio-sm-expanded)] md:aspect-[var(--ratio-md-expanded)]':
            placement == 'singleVideo' || !collapsed
        }
      )}
      data-testid="ContentHero"
    >
      <ContentHeader
        languageSlug={languageSlug?.replace('.html', '')}
        isPersistent={placement == 'carouselItem'}
      />
      <VideoBlockPlayer
        isPreview={placement == 'carouselItem'}
        collapsed={collapsed}
        placement={placement}
        onMuteToggle={handleMuteToggle}
        currentMuxInsert={currentMuxInsert}
        onMuxInsertComplete={onMuxInsertComplete}
        onSkip={onSkipActiveVideo}
        wasUnmuted={wasUnmuted}
        key={currentMuxInsert ? currentMuxInsert.id : variant?.hls}
      />
    </div>
  )
}
