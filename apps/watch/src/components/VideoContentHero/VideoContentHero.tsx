import clsx from 'clsx'
import { ReactElement, useCallback, useState } from 'react'

import { usePlayer } from '../../libs/playerContext/PlayerContext'
import { useVideo } from '../../libs/videoContext/VideoContext'
import type { CarouselMuxSlide } from '../../types/inserts'
import { ContentHeader } from '../ContentHeader'

import { HeroVideo } from './HeroVideo'

export function VideoContentHero({
  isPreview = false,
  placement,
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
  const [collapsed, setCollapsed] = useState(true)

  const languageSlug = variant?.slug?.split('/')[1]

  const handleMuteToggle = useCallback((isMuted: boolean): void => {
    setCollapsed(isMuted)
  }, [])

  return (
    <div
      className={clsx(
        'relative z-[1] flex w-full items-end overflow-hidden bg-[#000] transition-all duration-300 ease-out',
        {
          'aspect-[var(--ratio-sm)] md:aspect-[var(--ratio-md)]':
            isPreview && collapsed,
          'aspect-[var(--ratio-sm-expanded)] md:aspect-[var(--ratio-md-expanded)]':
            !isPreview || !collapsed
        }
      )}
      data-testid="ContentHero"
    >
      <ContentHeader
        languageSlug={languageSlug?.replace('.html', '')}
        isPersistent={isPreview}
      />
      <HeroVideo
        isPreview={isPreview}
        collapsed={collapsed}
        placement={placement ?? 'singleVideo'}
        onMuteToggle={handleMuteToggle}
        currentMuxInsert={currentMuxInsert}
        onMuxInsertComplete={onMuxInsertComplete}
        onSkip={onSkipActiveVideo}
        key={currentMuxInsert ? currentMuxInsert.id : variant?.hls}
      />
      <div
        data-testid="ContainerHeroTitleContainer"
        className="relative z-2 mx-auto flex w-full max-w-[1920px] flex-col pb-4 sm:flex-row"
      >
        <div
          className="pointer-events-none absolute top-0 right-0 left-0 block h-full w-full md:hidden"
          style={{
            backdropFilter: 'brightness(.6) blur(40px)',
            maskImage:
              'linear-gradient(0deg, rgba(2,0,36,1) 46%, rgba(2,0,36,1) 53%, rgba(0,0,0,0) 100%)'
          }}
        />
      </div>
    </div>
  )
}
