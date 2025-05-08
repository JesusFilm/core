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

  const title = video?.title[0]?.value ?? ''
  const snippet = video?.snippet[0]?.value ?? ''

  return (
    <Box
      sx={{
        height: { xs: '90svh', md: '70svh' },
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
        <Box
          data-testid="ContainerHeroTitle"
          sx={{
            width: '100%',
            display: 'flex',
            px: { xs: 4, sm: 6, md: 8, lg: 10, xl: 12 },
            pb: 10,
            minHeight: '500px',
            alignItems: 'flex-end'
          }}
        >
          <Box
            sx={{
              pb: { xs: 4, sm: 0 },
              width: '100%',
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                zIndex: 2,
                gap: 4
              }}
            >
              <Typography
                component="h1"
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  color: 'text.primary',
                  opacity: 0.9,
                  mixBlendMode: 'screen',
                  flexGrow: 1,
                  mb: 1
                }}
              >
                {title}
              </Typography>
              <ContentHeroMuteButton
                isMuted={isMuted}
                onClick={handleToggleMute}
              />
            </Box>

            <Typography
              component="h4"
              variant="h6"
              data-testid="ContainerHeroDescription"
              sx={{
                opacity: 0.5,
                mixBlendMode: 'screen',
                zIndex: 2,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'text.primary'
              }}
            >
              {snippet}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
