import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { secondsToMinutes } from '@core/shared/ui/timeFormat'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import PlayArrow from '@mui/icons-material/PlayArrow'
import AccessTime from '@mui/icons-material/AccessTime'
import Circle from '@mui/icons-material/Circle'

import videojs from 'video.js'
import 'video.js/dist/video-js.css'

import { GetVideo_video as Video } from '../../../../__generated__/GetVideo'
import { GetVideoSiblings as VideoSiblings } from '../../../../__generated__/GetVideoSiblings'

interface VideoHeroProps {
  loading: boolean
  routes: string[]
  video: Video
  siblingVideos: VideoSiblings
}

export function VideoHero({
  loading,
  routes,
  video,
  siblingVideos
}: VideoHeroProps): ReactElement {
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
    <>
      {loading && <CircularProgress />}
      <>
        <Box
          sx={{
            backgroundImage: `url(${video.image as string})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: 776
          }}
        >
          {video.variant?.hls != null && (
            <video
              ref={videoRef}
              className="vjs-jfp video-js vjs-fill"
              style={{
                alignSelf: 'center'
              }}
              playsInline
            >
              <source src={video.variant.hls} type="application/x-mpegURL" />
            </video>
          )}
          {!isPlaying && (
            <>
              <Container
                maxWidth="xl"
                style={{
                  position: 'absolute',
                  top: 350,
                  paddingLeft: 100,
                  margin: 0,
                  textShadow: '0px 3px 4px rgba(0, 0, 0, 0.25)'
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    maxWidth: '600px',
                    color: 'text.primary'
                  }}
                >
                  {video.title[0]?.value}
                </Typography>
              </Container>
              <Box
                sx={{
                  position: 'absolute',
                  top: '520px'
                }}
                width="100%"
                height="133px"
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  px="100px"
                  sx={{ color: 'text.primary' }}
                >
                  <Stack direction="row" spacing="20px">
                    {video.children.length > 0 && (
                      <Typography variant="subtitle1">
                        {video.children.length} episodes
                      </Typography>
                    )}
                    {video.children.length === 0 && (
                      <>
                        <Button
                          size="large"
                          variant="contained"
                          sx={{ height: 71, fontSize: '24px' }}
                          onClick={playVideo}
                        >
                          <PlayArrow />
                          &nbsp; Play Video
                        </Button>
                        {video.variant !== null && (
                          <Stack height="71px" direction="row">
                            <AccessTime sx={{ paddingTop: '23px' }} />
                            <Typography
                              variant="body2"
                              sx={{ lineHeight: '71px', paddingLeft: '10px' }}
                            >
                              {secondsToMinutes(video.variant.duration)} min
                            </Typography>
                          </Stack>
                        )}
                        <Circle sx={{ fontSize: '10px', paddingTop: '30px' }} />
                      </>
                    )}
                  </Stack>
                </Stack>
              </Box>
              <Box
                sx={{
                  backgroundColor: 'rgba(18, 17, 17, 0.25)',
                  position: 'absolute',
                  top: '643px'
                }}
                width="100%"
                height="133px"
              >
                <Stack pt="34px" mx="100px" width="100%" direction="row">
                  <Stack direction="row">&nbsp;</Stack>
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </>
    </>
  )
}
