import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { secondsToMinutes } from '@core/shared/ui/timeFormat'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import AccessTime from '@mui/icons-material/AccessTime'
import Image from 'next/image'

import videojs from 'video.js'
import 'video.js/dist/video-js.css'

import { GetVideo_video as Video } from '../../../../__generated__/GetVideo'

interface VideoHeroProps {
  video: Video
}

export function VideoHero({ video }: VideoHeroProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        autoplay: false,
        controls: true,
        userActions: {
          hotkeys: true,
          doubleClick: true
        },
        controlBar: {
          playToggle: true,
          captionsButton: true,
          subtitlesButton: true,
          remainingTimeDisplay: true,
          progressControl: {
            seekBar: true
          },
          fullscreenToggle: true,
          volumePanel: {
            inline: false
          }
        },
        responsive: true,
        poster: video?.image ?? undefined
      })
      playerRef.current.on('pause', pauseVideo)
      playerRef.current.on('play', playVideo)
    }
  })

  function playVideo(): void {
    setIsPlaying(true)
    videoRef?.current?.play()
  }

  function pauseVideo(): void {
    setIsPlaying(false)
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: 776,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        '.video-js .vjs-big-play-button': {
          display: 'none'
        }
      }}
    >
      {video.variant?.hls != null && (
        <video
          ref={videoRef}
          className="vjs-jfp video-js vjs-fill"
          style={{
            alignSelf: 'center',
            position: 'absolute'
          }}
          playsInline
        >
          <source src={video.variant.hls} type="application/x-mpegURL" />
        </video>
      )}
      {!isPlaying && (
        <>
          <Image
            src={video?.image ?? ''}
            alt={video?.title[0].value ?? ''}
            layout="fill"
            objectFit="cover"
            style={{
              zIndex: 1
            }}
          />
          <Container
            maxWidth="xl"
            sx={{
              pt: 50,
              zIndex: 2
            }}
          >
            <Stack spacing={5} width="60%">
              <Typography variant="h2" color="text.primary">
                {video.title[0]?.value}
              </Typography>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={4}
                sx={{ color: 'text.primary', width: '100%' }}
              >
                <Button size="medium" variant="contained" onClick={playVideo}>
                  <PlayArrowRounded />
                  Play Video
                </Button>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="center"
                  alignItems="center"
                >
                  <AccessTime />
                  {video.variant !== null && (
                    <Typography variant="body1">
                      {secondsToMinutes(video.variant.duration)} min
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </Container>
        </>
      )}
    </Box>
  )
}
