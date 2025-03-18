import VolumeOffOutlined from '@mui/icons-material/VolumeOffOutlined'
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import { getLabelDetails } from '../../../libs/utils/getLabelDetails/getLabelDetails'
import { useVideo } from '../../../libs/videoContext'

export function ContainerHero(): ReactElement {
  const { label: videoLabel, title, childrenCount } = useVideo()
  const { t } = useTranslation('apps-watch')
  const { label, childCountLabel } = getLabelDetails(videoLabel, childrenCount)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [hasUnmutedOnce, setHasUnmutedOnce] = useState(false)

  const pauseVideoOnScrollAway = useCallback((): void => {
    const scrollY = window.scrollY
    if (playerRef.current) {
      if (scrollY > 500) {
        playerRef.current.pause()
      } else if (scrollY === 0) {
        void playerRef.current.play()
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', pauseVideoOnScrollAway)
    return () => window.removeEventListener('scroll', pauseVideoOnScrollAway)
  }, [])

  useEffect(() => {
    if (!videoRef.current) return

    // Initialize player
    const player = videojs(videoRef.current, {
      ...defaultVideoJsOptions,
      autoplay: true,
      controls: false,
      loop: true,
      muted: true,
      fluid: false,
      fill: true,
      responsive: false,
      aspectRatio: undefined
    })

    playerRef.current = player

    // Sync muted state with player
    player.on('volumechange', () => {
      setIsMuted(player.muted() ?? true)
    })

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.dispose()
        } catch (e) {
          console.error('Error disposing video player:', e)
        }
        playerRef.current = null
      }
    }
  }, [])

  return (
    <Box
      sx={{
        height: '70vh',
        width: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        position: 'relative',
        transition: 'height 0.3s ease-out',
        backgroundColor: 'background.default'
      }}
      data-testid="ContainerHero"
    >
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '75%'
        }}
      >
        <video
          ref={videoRef}
          className="video-js"
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        >
          <source
            src="https://stream.mux.com/OWsElOe7FF8fR8lwFVY4uqGFc01xgKwQZIIcrIgu4aKc.m3u8"
            type="application/x-mpegURL"
          />
        </video>
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          width: '100%',
          pt: 50,
          pb: { xs: 4, sm: 11 },
          position: 'relative'
        }}
      >
        <Box
          sx={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            width: '100%',
            borderRadius: 'inherit',
            backdropFilter: 'brightness(.6) blur(40px)',
            zIndex: 1,
            pointerEvents: 'none',
            mask: 'linear-gradient(0deg, rgba(2,0,36,1) 46%, rgba(2,0,36,1) 53%, rgba(0,0,0,0) 100%)'
          }}
        />
        <Container
          maxWidth="xxl"
          sx={{
            display: 'flex'
          }}
        >
          <Stack
            direction="column"
            sx={{
              pb: { xs: 4, sm: 0 },
              width: '100%',
              position: 'relative',
              zIndex: 2
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                zIndex: 2
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontSize: '3.75rem',
                  fontWeight: 700,
                  color: 'white',
                  opacity: 0.9,
                  mixBlendMode: 'screen',
                  marginBottom: '0.25rem',
                  flexGrow: 1
                }}
              >
                {title[0].value}
              </Typography>
              <IconButton
                onClick={() => {
                  if (playerRef.current) {
                    const newMutedState = !isMuted
                    playerRef.current.muted(newMutedState)
                    setIsMuted(newMutedState)

                    // If unmuting for the first time, restart video
                    if (!newMutedState && !hasUnmutedOnce) {
                      playerRef.current.currentTime(0)
                      void playerRef.current.play()
                      setHasUnmutedOnce(true)
                    }
                  }
                }}
                sx={{
                  padding: '0.75rem',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  marginLeft: '1rem',
                  marginBottom: '-0.75rem',
                  marginRight: '0.25rem',
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)'
                  }
                }}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeOffOutlined sx={{ fontSize: 32 }} />
                ) : (
                  <VolumeUpOutlined sx={{ fontSize: 32 }} />
                )}
              </IconButton>
            </Box>
            <Typography
              variant="overline1"
              color="secondary.contrastText"
              sx={{
                opacity: 0.5,
                mixBlendMode: 'screen',
                zIndex: 2
              }}
            >
              {`${label} \u2022 ${childCountLabel.toLowerCase()}`}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontSize: '1.125rem',
                color: 'primary.main',
                textWrap: 'balance',
                zIndex: 2,
                marginTop: '2rem'
              }}
            >
              {t(
                'Easter {{year}} videos & resources about Lent, Holy Week, Resurrection',
                {
                  year: new Date().getFullYear()
                }
              )}
            </Typography>
          </Stack>
        </Container>
      </Stack>
    </Box>
  )
}
