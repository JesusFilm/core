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
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '1800px',
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
        <div className="w-full padded">
          <div className="flex flex-col pb-4 sm:pb-0 w-full relative z-10">
            <div className="flex items-center justify-between w-full relative z-10">
              <h2 className="text-6xl font-bold text-white opacity-90 mb-1 flex-grow">
                {title[0].value}
              </h2>
              <button
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
                className="p-2 rounded-full bg-black bg-opacity-50 text-white ml-4 mb-1 mr-1 transition duration-300 hover:bg-opacity-70"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeOffOutlined sx={{ fontSize: 32 }} />
                ) : (
                  <VolumeUpOutlined sx={{ fontSize: 32 }} />
                )}
              </button>
            </div>
            <p className="text-sm text-secondary-contrast opacity-50 relative z-10">
              {`${label} \u2022 ${childCountLabel.toLowerCase()}`}
            </p>
            <p className="text-2xl text-red-500/80 relative z-10 mt-8">
              {t(
                'Easter {{year}} videos & resources about Lent, Holy Week, Resurrection',
                {
                  year: new Date().getFullYear()
                }
              )}
            </p>
          </div>
        </div>
      </Stack>
    </Box>
  )
}
