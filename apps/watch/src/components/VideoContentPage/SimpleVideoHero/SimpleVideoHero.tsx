import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded'
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded'
import IconButton from '@mui/material/IconButton'
import { alpha, useTheme } from '@mui/material/styles'
import { ReactElement, useCallback, useState } from 'react'
import Player from 'video.js/dist/types/player'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'

import { useVideo } from '../../../libs/videoContext'

import { VideoHeader } from './VideoHeader'
import { VideoPlayer } from './VideoPlayer'

export function SimpleVideoHero(): ReactElement {
  const { title } = useVideo()
  const [playerRef, setPlayerRef] = useState<Player | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [hasUnmutedOnce, setHasUnmutedOnce] = useState(false)
  const theme = useTheme()

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

      // If un-muting for the first time, restart video
      if (!newMutedState && !hasUnmutedOnce) {
        playerRef.currentTime(0)
        void playerRef.play()
        setHasUnmutedOnce(true)
      }
    }
  }, [isMuted, hasUnmutedOnce, playerRef])

  return (
    <div
      className="h-[90vh] md:h-[87vh] w-full flex items-end relative transition-height duration-300 ease-out bg-stone-900 font-sans"
      data-testid="ContainerHero"
    >
      <VideoHeader />
      <VideoPlayer
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
          className="w-full flex padded pb-4 min-h-[500px] items-end"
        >
          <div className="pb-4 sm:pb-0 w-full relative z-[2] flex flex-col">
            <div className="flex items-center justify-between w-full z-[2]">
              <h2 className="text-[3.75rem] font-bold text-white opacity-90 mix-blend-screen mb-1 flex-grow">
                {title?.[0]?.value ?? ''}
              </h2>
              <IconButton
                size="large"
                onClick={handleToggleMute}
                sx={{
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.secondary.main, 0.3)
                  }
                }}
              >
                {isMuted ? <VolumeOffRoundedIcon /> : <VolumeUpRoundedIcon />}
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
