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

  return (
    <div
      className={`${
        isFullscreen ? 'h-[100svh]' : 'h-[90svh] md:h-[80svh]'
      } w-full flex items-end relative bg-[#131111] z-[1] transition-all duration-300 ease-out`}
      data-testid="ContentHero"
    >
      <ContentHeader />
      <HeroVideo isFullscreen={isFullscreen} key={variant?.hls} />
      <div
        data-testid="ContainerHeroTitleContainer"
        className="w-full relative flex flex-col sm:flex-row max-w-[1920px] mx-auto pb-4"
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
