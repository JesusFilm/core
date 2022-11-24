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

  // TODO: refactor according to how overlay works

  return (
    <Box
      sx={{
        width: '100%',
        height: 776,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        '> .video-js .vjs-big-play-button': {
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
          <Box
            sx={{
              position: 'absolute',
              height: '100%',
              width: '100%'
            }}
          >
            <Image
              src={video?.image ?? ''}
              alt={video?.title[0].value ?? ''}
              layout="fill"
              objectFit="cover"
              style={{
                zIndex: 1
              }}
            />
            <Box
              sx={{
                zIndex: 1,
                position: 'absolute',
                height: '100%',
                width: '100%',
                background:
                  'linear-gradient(180deg, rgba(50, 50, 51, 0) 64%, rgba(38, 38, 38, 0.3) 76%, rgba(27, 27, 28, 0.46) 86%, #000000 100%), linear-gradient(90deg, #141414 16%, rgba(10, 10, 10, 0.5) 24%, rgba(4, 4, 4, 0.2) 31%, rgba(0, 0, 0, 0) 40%)'
              }}
            />
          </Box>
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
