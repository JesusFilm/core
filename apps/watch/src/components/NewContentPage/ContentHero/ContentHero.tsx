import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement, useCallback, useState } from 'react'
import Player from 'video.js/dist/types/player'

import { useVideo } from '../../../libs/videoContext'

import { ContentHeader } from './ContentHeader'
import { ContentHeroMuteButton } from './ContentHeroMuteButton'
import { ContentHeroVideo } from './ContentHeroVideo'

export function ContentHero(): ReactElement {
  const video = useVideo()

  const [player, setPlayer] = useState<Player | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [hasUnmutedOnce, setHasUnmutedOnce] = useState(false)

  const handlePlayerReady = useCallback((player: Player): void => {
    setPlayer(player)
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

  return (
    <Box
      sx={{
        height: { xs: '90svh', md: '80svh' },
        width: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        position: 'relative',
        transition: 'height 0.3s ease-out',
        bgcolor: 'background.default'
      }}
      data-testid="ContainerHero"
    >
      <ContentHeader />
      <ContentHeroVideo onPlayerReady={handlePlayerReady} />
      <Box
        data-testid="ContainerHeroTitleContainer"
        sx={{
          width: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          maxWidth: '1920px',
          mx: 'auto',
          pb: 4
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            width: '100%',
            pointerEvents: 'none',
            display: { xs: 'block', md: 'none' },
            backdropFilter: 'brightness(.6) blur(40px)',
            maskImage:
              'linear-gradient(0deg, rgba(2,0,36,1) 46%, rgba(2,0,36,1) 53%, rgba(0,0,0,0) 100%)'
          }}
        />
      </Box>
    </Box>
  )
}
