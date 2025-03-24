import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useState } from 'react'
import Player from 'video.js/dist/types/player'

import { getLabelDetails } from '../../../libs/utils/getLabelDetails/getLabelDetails'
import { useVideo } from '../../../libs/videoContext'

import { ContainerHeroMuteButton } from './ContainerHeroMuteButton'
import { ContainerHeroVideo } from './ContainerHeroVideo'

export function ContainerHero(): ReactElement {
  const { label: videoLabel, title, childrenCount } = useVideo()
  const { t } = useTranslation('apps-watch')
  const { label, childCountLabel } = getLabelDetails(videoLabel, childrenCount)
  const [playerRef, setPlayerRef] = useState<Player | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [hasUnmutedOnce, setHasUnmutedOnce] = useState(false)

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
      className="h-[70vh] w-full flex items-end relative transition-height duration-300 ease-out bg-background"
      data-testid="ContainerHero"
    >
      <ContainerHeroVideo
        onMutedChange={handleMutedChange}
        onPlayerReady={handlePlayerReady}
      />

      <div className="w-full pt-[200px] pb-4 sm:pb-11 relative flex flex-col sm:flex-row">
        <div
          className="absolute top-0 left-0 right-0 h-full w-full pointer-events-none z-[1]"
          style={{
            backdropFilter: 'brightness(.6) blur(40px)',
            mask: 'linear-gradient(0deg, rgba(2,0,36,1) 46%, rgba(2,0,36,1) 53%, rgba(0,0,0,0) 100%)'
          }}
        />
        <div className="container mx-auto flex max-w-[1536px] px-4">
          <div className="pb-4 sm:pb-0 w-full relative z-[2] flex flex-col">
            <div className="flex items-center justify-between w-full z-[2]">
              <h2 className="text-[3.75rem] font-bold text-white opacity-90 mix-blend-screen mb-1 flex-grow">
                {title[0].value}
              </h2>
              <ContainerHeroMuteButton
                isMuted={isMuted}
                onClick={handleToggleMute}
              />
            </div>
            <p className="text-secondary-contrast opacity-50 mix-blend-screen z-[2] uppercase tracking-widest font-montserrat text-white">
              {`${label} \u2022 ${childCountLabel.toLowerCase()}`}
            </p>
            <p className="text-[1.125rem] text-primary mt-8 z-[2] text-balance font-apercu">
              {t(
                'Easter {{year}} videos & resources about Lent, Holy Week, Resurrection',
                {
                  year: new Date().getFullYear()
                }
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
