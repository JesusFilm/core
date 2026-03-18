import { ReactElement, useCallback, useState } from 'react'
import Player from 'video.js/dist/types/player'

import { ContainerHeroVideo } from '../ContainerHeroVideo'

import { CollectionsHeader } from './CollectionsHeader'
import { ContainerHeroMuteButton } from './ContainerHeroMuteButton'

export interface ContainerHeroProps {
  /** Title displayed in the hero section */
  title: string
  /** Text before the year in the description */
  descriptionBeforeYear: string
  /** Text after the year in the description */
  descriptionAfterYear: string
  /** Label for the feedback button */
  feedbackButtonLabel: string
}

export function ContainerHero({
  title,
  descriptionBeforeYear,
  descriptionAfterYear,
  feedbackButtonLabel
}: ContainerHeroProps): ReactElement {
  const [playerRef, setPlayerRef] = useState<Player | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [hasUnmutedOnce, setHasUnmutedOnce] = useState(false)
  const currentYear = new Date().getFullYear()

  const handlePlayerReady = useCallback((player: Player): void => {
    setPlayerRef(player)
  }, [])

  const handleMutedChange = useCallback((muted: boolean): void => {
    setIsMuted(muted)
  }, [])

  const handleToggleMute = useCallback((): void => {
    if (playerRef) {
      const newMutedState = !isMuted
      playerRef.muted(newMutedState)
      setIsMuted(newMutedState)

      // If unmuting for the first time, restart video
      if (!newMutedState && !hasUnmutedOnce) {
        playerRef.currentTime(0)
        void playerRef.play()
        setHasUnmutedOnce(true)
      }
    }
  }, [isMuted, hasUnmutedOnce, playerRef])

  return (
    <div
      className="transition-height relative flex h-[90vh] w-full items-end bg-stone-900 font-sans duration-300 ease-out md:h-[70vh]"
      data-testid="ContainerHero"
    >
      <CollectionsHeader feedbackButtonLabel={feedbackButtonLabel} />
      <ContainerHeroVideo
        onMutedChange={handleMutedChange}
        onPlayerReady={handlePlayerReady}
      />

      <div
        data-testid="ContainerHeroTitleContainer"
        className="relative mx-auto flex w-full max-w-[1920px] flex-col pb-4 sm:flex-row"
      >
        <div
          className="pointer-events-none absolute top-0 right-0 left-0 h-full w-full md:hidden"
          style={{
            backdropFilter: 'brightness(.6) blur(40px)',
            mask: 'linear-gradient(0deg, rgba(2,0,36,1) 46%, rgba(2,0,36,1) 53%, rgba(0,0,0,0) 100%)'
          }}
        />
        <div
          data-testid="ContainerHeroTitle"
          className="padded flex min-h-[500px] w-full items-end pb-4"
        >
          <div className="relative z-[2] flex w-full flex-col pb-4 sm:pb-0">
            <div className="z-[2] flex w-full items-center justify-between">
              <h2 className="mb-1 flex-grow text-[3.75rem] font-bold text-white opacity-90 mix-blend-screen">
                {title}
              </h2>
              <ContainerHeroMuteButton
                isMuted={isMuted}
                onClick={handleToggleMute}
              />
            </div>

            <h1
              className="text-secondary-contrast z-[2] tracking-widest text-white uppercase opacity-50 mix-blend-screen"
              data-testid="ContainerHeroDescription"
            >
              {`${descriptionBeforeYear} ${currentYear} ${descriptionAfterYear}`}
            </h1>
          </div>
        </div>
      </div>
    </div>
  )
}
