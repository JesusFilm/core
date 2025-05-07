import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded'
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { alpha, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement, useCallback, useState } from 'react'
import Player from 'video.js/dist/types/player'

import { useVideo } from '../../../libs/videoContext'

import { VideoHeader } from './VideoHeader'
import { VideoPlayer } from './VideoPlayer'

export function SimpleVideoHero(): ReactElement {
  const { title } = useVideo()
  const [player, setPlayer] = useState<Player | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [hasUnmutedOnce, setHasUnmutedOnce] = useState(false)
  const theme = useTheme()

  const handleSetPlayer = useCallback((newPlayer: Player): void => {
    setPlayer(newPlayer)
  }, [])

  const handleMutedChange = useCallback((muted: boolean): void => {
    setIsMuted(muted)
  }, [])

  const handleToggleMute = useCallback((): void => {
    if (player) {
      const newMutedState = !isMuted
      player.muted(newMutedState)
      setIsMuted(newMutedState)

      // If un-muting for the first time, restart video
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
        height: { xs: '90vh', md: '87vh' },
        width: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        position: 'relative',
        transition: 'height 0.3s',
        backgroundColor: 'background.default',
        fontFamily: 'sans-serif'
      }}
      data-testid="ContainerHero"
    >
      <VideoHeader />
      <VideoPlayer
        onMutedChange={handleMutedChange}
        handleSetPlayer={handleSetPlayer}
        player={player}
      />

      <Stack
        data-testid="ContainerHeroTitleContainer"
        sx={{
          width: '100%',
          position: 'relative',
          maxWidth: '1920px',
          mx: 'auto',
          pb: 4
        }}
        direction="row"
      >
        <Stack
          data-testid="ContainerHeroTitle"
          direction="row"
          alignItems="flex-end"
          sx={{
            width: '100%',
            pb: 4,
            minHeight: '500px'
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: '100%' }}
          >
            <Typography
              component="h2"
              sx={{
                fontSize: '3.75rem',
                fontWeight: 'bold',
                color: 'white',
                opacity: 0.9,
                mixBlendMode: 'screen',
                mb: 1,
                flexGrow: 1
              }}
            >
              {title?.[0]?.value ?? ''}
            </Typography>
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
          </Stack>
        </Stack>
      </Stack>
    </Box>
  )
}
