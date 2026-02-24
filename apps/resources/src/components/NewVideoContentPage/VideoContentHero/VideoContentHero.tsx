import fscreen from 'fscreen'
import { ReactElement, useEffect } from 'react'

import { useVideo } from '../../../libs/videoContext'

import { ContentHeader } from './ContentHeader'
import { HeroVideo } from './HeroVideo'

export function VideoContentHero({
  isFullscreen = false,
  setIsFullscreen
}: {
  isFullscreen?: boolean
  setIsFullscreen?: (isFullscreen: boolean) => void
}): ReactElement {
  const { variant } = useVideo()
  /**
   * Effect to handle fullscreen changes.
   * Adds and removes event listeners for fullscreen state changes.
   */
  useEffect(() => {
    /**
     * Handler for fullscreen change events.
     * Updates component state and scrolls to top when entering fullscreen.
     */
    function fullscreenchange(): void {
      const isFullscreen = fscreen.fullscreenElement != null
      setIsFullscreen?.(isFullscreen)
      if (isFullscreen) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    fscreen.addEventListener('fullscreenchange', fullscreenchange)

    return () =>
      fscreen.removeEventListener('fullscreenchange', fullscreenchange)
  }, [setIsFullscreen])

  const languageSlug = variant?.slug?.split('/')[1]

  return (
    <div
      className={`${
        isFullscreen ? 'h-[100svh]' : 'h-[90svh] md:h-[80svh]'
      } relative z-[1] flex w-full items-end bg-[#131111] transition-all duration-300 ease-out`}
      data-testid="ContentHero"
    >
      <ContentHeader languageSlug={languageSlug?.replace('.html', '')} />
      <HeroVideo isFullscreen={isFullscreen} key={variant?.hls} />
      <div
        data-testid="ContainerHeroTitleContainer"
        className="relative mx-auto flex w-full max-w-[1920px] flex-col pb-4 sm:flex-row"
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
