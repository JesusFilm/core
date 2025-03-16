import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import VolumeOffOutlined from '@mui/icons-material/VolumeOffOutlined'
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ReactElement, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import { getLabelDetails } from '../../../libs/utils/getLabelDetails/getLabelDetails'
import { useVideo } from '../../../libs/videoContext'
import { HeroOverlay } from '../../HeroOverlay'
import { AudioLanguageButton } from '../../VideoContentPage/AudioLanguageButton'

interface ContainerHeroProps {
  openDialog: () => void
}

export function ContainerHero({
  openDialog
}: ContainerHeroProps): ReactElement {
  const { label: videoLabel, title, childrenCount, images } = useVideo()
  const { label, childCountLabel } = getLabelDetails(videoLabel, childrenCount)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player | null>(null)
  const [videoHeight, setVideoHeight] = useState(40)
  const [isMuted, setIsMuted] = useState(true)
  const [hasUnmutedOnce, setHasUnmutedOnce] = useState(false)

  useEffect(() => {
    const handleScroll = (): void => {
      const scrollY = window.scrollY
      if (scrollY > 0) {
        const newHeight = Math.max(0, 40 - scrollY / 5)
        setVideoHeight(newHeight)
      } else {
        setVideoHeight(40)
      }

      // Control video playback based on scroll position
      if (playerRef.current) {
        if (scrollY > 500) {
          playerRef.current.pause()
        } else if (scrollY === 0) {
          void playerRef.current.play()
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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

    // Cleanup
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
        // overflow: 'hidden',
        transition: 'height 0.3s ease-out'
        // '&:before': {
        //   content: '""',
        //   position: 'fixed',
        //   top: '40vh',
        //   left: 0,
        //   right: 0,
        //   bottom: 0,
        //   borderRadius: 'inherit',
        //   backdropFilter: 'brightness(.6) blur(40px)',
        //   zIndex: 1,
        //   pointerEvents: 'none',
        //   mask: 'radial-gradient(circle at 40% -310%, transparent 80%, black 85%)'
        //   // mask: 'radial-gradient(circle at 40% -20%, transparent 60%, white 85%),radial-gradient(circle at 50% 100%, transparent 75%, white 93%)'
        // }
      }}
      data-testid="ContainerHero"
    >
      <div
        className="fixed top-0 left-0 right-0 w-full"
        style={{
          // height: `${videoHeight}vh`,

          height: `65vh`,
          transition: 'height 0.3s ease-out'
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
      </div>
      <Container
        maxWidth="xxl"
        sx={{
          display: 'flex',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 340,
            left: 0,
            right: 0,
            height: 590,
            borderRadius: 'inherit',
            backdropFilter: 'brightness(.6) blur(40px)',
            zIndex: 1,
            pointerEvents: 'none',
            mask: 'linear-gradient(-5deg, transparent 10%, black 35%, black 65%, transparent 90%)'
          }
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ width: '100%', pb: { xs: 4, sm: 11 } }}
        >
          <Stack direction="column" sx={{ pb: { xs: 4, sm: 0 } }}>
            <div className="flex items-center justify-between w-full z-[2]">
              <h2 className="text-6xl font-bold text-white opacity-90 mix-blend-screen mb-1 flex-1">
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
                className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors ml-4 -mb-3 mr-1"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeOffOutlined sx={{ fontSize: 32 }} />
                ) : (
                  <VolumeUpOutlined sx={{ fontSize: 32 }} />
                )}
              </button>
            </div>
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
            <h1 className="text-lg text-red-400/80 text-balance z-2 mt-8">
              Easter {new Date().getFullYear()} videos &amp; resources about
              Lent, Holy Week, Resurrection
            </h1>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
