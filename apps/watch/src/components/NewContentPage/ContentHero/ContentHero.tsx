import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useState } from 'react'
import Player from 'video.js/dist/types/player'

import { useVideo } from '../../../libs/videoContext'

import { ContentHeader } from './ContentHeader'
import { ContentHeroVideo } from './ContentHeroVideo'
import { ContentHeroMuteButton } from './ContentHeroMuteButton'

export function ContentHero(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const video = useVideo()

  const [player, setPlayer] = useState<Player | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [hasUnmutedOnce, setHasUnmutedOnce] = useState(false)

  const handlePlayerReady = useCallback((player: Player): void => {
    setPlayer(player)
  }, [])

  const handleMutedChange = useCallback((muted: boolean): void => {
    setIsMuted(muted)
  }, [])

  const handleToggleMute = useCallback((): void => {
    if (player) {
      const newMutedState = !isMuted
      player.muted(newMutedState)
      setIsMuted(newMutedState)

      // If unmuting for the first time, restart video
      if (!newMutedState && !hasUnmutedOnce) {
        player.currentTime(0)
        void player.play()
        setHasUnmutedOnce(true)
      }
    }
  }, [isMuted, hasUnmutedOnce, player])

  const title = video?.title[0]?.value ?? ''
  const snippet = video?.snippet[0]?.value ?? ''

  return (
    <div
      className="h-[90vh] md:h-[70vh] w-full flex items-end relative transition-height duration-300 ease-out bg-stone-900 font-sans"
      data-testid="ContainerHero"
    >
      <ContentHeader feedbackButtonLabel={t('Give Feedback')} />
      <ContentHeroVideo
        onMutedChange={handleMutedChange}
        onPlayerReady={handlePlayerReady}
      />
      <div
        data-testid="ContainerHeroTitleContainer"
        className="w-full relative flex flex-col sm:flex-row max-w-[1920px] mx-auto pb-4"
      >
        <div
          className="absolute top-0 left-0 right-0 h-full w-full pointer-events-none md:hidden"
          style={{
            backdropFilter: 'brightness(.6) blur(40px)',
            mask: 'linear-gradient(0deg, rgba(2,0,36,1) 46%, rgba(2,0,36,1) 53%, rgba(0,0,0,0) 100%)'
          }}
        />
        <div
          data-testid="ContainerHeroTitle"
          className="w-full flex padded pb-4
          min-h-[500px] items-end"
        >
          <div className="pb-4 sm:pb-0 w-full relative z-[2] flex flex-col">
            <div className="flex items-center justify-between w-full z-[2]">
              <h2 className="text-[3.75rem] font-bold text-white opacity-90 mix-blend-screen flex-grow mb-1">
                {title}
              </h2>
              <ContentHeroMuteButton
                isMuted={isMuted}
                onClick={handleToggleMute}
              />
            </div>

            <h1
              className="text-secondary-contrast opacity-50 mix-blend-screen z-[2] uppercase tracking-widest text-white"
              data-testid="ContainerHeroDescription"
            >
              {snippet}
            </h1>
          </div>
        </div>
      </div>
    </div>
  )
}
