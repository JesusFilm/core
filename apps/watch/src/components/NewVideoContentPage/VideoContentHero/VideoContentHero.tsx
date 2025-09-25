import clsx from 'clsx'
import { ReactElement, useCallback, useState } from 'react'

import { usePlayer } from '../../../libs/playerContext'
import { useVideo } from '../../../libs/videoContext'
import type { CarouselMuxSlide } from '../../../types/inserts'

import { ContentHeader } from './ContentHeader'
import { HeroVideo } from './HeroVideo'

export function VideoContentHero({
  isPreview = false,
  currentMuxInsert,
  onMuxInsertComplete
}: {
  isPreview?: boolean
  currentMuxInsert?: CarouselMuxSlide | null
  onMuxInsertComplete?: () => void
}): ReactElement {
  const { variant } = useVideo()
  const {
    state: { mute }
  } = usePlayer()
  const [collapsed, setCollapsed] = useState(true)

  const languageSlug = variant?.slug?.split('/')[1]

  const handleMuteToggle = useCallback((isMuted: boolean): void => {
    setCollapsed(isMuted)
  }, [collapsed])

  return (
    <div
      className={clsx(
        'w-full flex items-end relative bg-[#131111] z-[1] transition-all duration-300 ease-out',
        {
          'preview-video': isPreview && collapsed,
          'h-[90svh] md:h-[80svh]': !isPreview || !collapsed
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
        onMuteToggle={handleMuteToggle}
        currentMuxInsert={currentMuxInsert}
        onMuxInsertComplete={onMuxInsertComplete}
        key={currentMuxInsert ? currentMuxInsert.id : variant?.hls}
      />
      <div
        data-testid="ContainerHeroTitleContainer"
        className="w-full relative z-2 flex flex-col sm:flex-row max-w-[1920px] mx-auto pb-4"
      >
        <div
          className="absolute top-0 left-0 right-0 h-full w-full pointer-events-none block md:hidden"
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
