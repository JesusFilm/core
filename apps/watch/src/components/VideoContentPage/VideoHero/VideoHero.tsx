import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { ReactElement, useRef, useEffect, useState } from 'react'
import { secondsToMinutes } from '@core/shared/ui/timeFormat'
import Container from '@mui/material/Container'
import PlayArrow from '@mui/icons-material/PlayArrow'
import AccessTime from '@mui/icons-material/AccessTime'
import Circle from '@mui/icons-material/Circle'
import videojs from 'video.js'
import { useVideo } from '../../../libs/videoContext'
import { VideoControls } from './VideoControls'

export function VideoHero(): ReactElement {
  const { id, image, variant, children, title } = useVideo()
  const [isPlaying, setIsPlaying] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()

  const ControlButton = videojs.getComponent('Button')

  class AudioControl extends ControlButton {
    constructor(player, options) {
      super(player, options)
      this.addClass('vjs-audio-button')
      this.controlText(player.localize('Audio Language'))
    }

    handleClick(): void {
      alert('open Audio Dialog')
    }
  }

  class SubtitleControl extends ControlButton {
    constructor(player, options) {
      super(player, options)
      this.addClass('vjs-subtitles-button')
      this.controlText(player.localize('Subtitle'))
    }

    handleClick(): void {
      alert('open Subtitle Dialog')
    }
  }

  videojs.registerComponent('audioControl', AudioControl)
  videojs.registerComponent('subtitleControl', SubtitleControl)

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
          remainingTimeDisplay: true,
          progressControl: {
            seekBar: true
          },
          fullscreenToggle: true,
          volumePanel: {
            inline: false
          },
          children: [
            'playToggle',
            'progressControl',
            'remainingTimeDisplay',
            'volumePanel',
            'audioControl',
            'subtitleControl',
            'fullscreenToggle'
          ]
        },
        responsive: true
      })
      playerRef.current.on('play', playVideo)
    }
  }, [playerRef, videoRef])

  function playVideo(): void {
    setIsPlaying(true)
    if (videoRef?.current != null) {
      videoRef?.current?.play()
    }
  }

  return (
    <>
      <>
        <Box
          data-testid={`video-${id}`}
          sx={{
            backgroundImage: `url(${image as string})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            width: '100%',
            height: { xs: 502, lg: 777 },
            position: 'relative',
            '> .video-js .vjs-control-bar': {
              display: fullscreen ? 'flex' : 'none'
            }
          }}
        >
          {variant?.hls != null && (
            <video
              ref={videoRef}
              id="vjs-jfp"
              className="vjs-jfp video-js vjs-fill"
              style={{
                alignSelf: 'center',
                position: 'absolute'
              }}
              playsInline
            >
              <source src={variant.hls} type="application/x-mpegURL" />
            </video>
          )}
          {playerRef.current != null && (
            <VideoControls
              player={playerRef.current}
              fullscreen={fullscreen}
              setFullscreen={(value: boolean) => setFullscreen(value)}
            />
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
                  {title[0]?.value}
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
                    {children.length > 0 && (
                      <Typography variant="subtitle1">
                        {children.length} episodes
                      </Typography>
                    )}
                    {children.length === 0 && (
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
                        {variant !== null && (
                          <Stack height="71px" direction="row">
                            <AccessTime sx={{ paddingTop: '23px' }} />
                            <Typography
                              variant="body2"
                              sx={{ lineHeight: '71px', paddingLeft: '10px' }}
                            >
                              {secondsToMinutes(variant.duration)} min
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
