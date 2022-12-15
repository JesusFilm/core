import Box from '@mui/material/Box'
import { ReactElement, useRef, useEffect, useState } from 'react'
import videojs from 'video.js'
import { useVideo } from '../../../libs/videoContext'
import { VideoControls } from './VideoControls'
import { VideoHeroOverlay } from './VideoHeroOverlay'

export function VideoHero(): ReactElement {
  const { id, variant } = useVideo()
  const [isPlaying, setIsPlaying] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()

  // TODO: custom buttons to be removed once fullscreen page is implemented
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
    if (videoRef.current != null && variant?.hls != null) {
      playerRef.current = videojs(videoRef.current, {
        autoplay: false,
        controls: true,
        sources: [
          {
            src: variant?.hls,
            type: 'application/x-mpegURL'
          }
        ],
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
      playerRef.current.on('play', handlePlay)
    }
  }, [variant, playerRef, videoRef])

  useEffect(() => {
    playerRef.current?.src({
      src: variant?.hls ?? '',
      type: 'application/x-mpegURL'
    })
    setIsPlaying(false)
  }, [variant?.hls])

  function handlePlay(): void {
    setIsPlaying(true)
    if (playerRef?.current != null) {
      playerRef?.current?.play()
    }
  }

  return (
    <Box
      data-testid={`video-${id}`}
      sx={{
        width: '100%',
        height: { xs: 502, lg: 777 },
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        '> .video-js .vjs-big-play-button': {
          display: 'none'
        },
        '> .video-js .vjs-control-bar': {
          display: fullscreen ? 'flex' : 'none'
        }
      }}
    >
      {variant?.hls != null && (
        <video
          ref={videoRef}
          className="vjs-jfp video-js vjs-fill"
          style={{
            alignSelf: 'center',
            position: 'absolute'
          }}
          playsInline
        />
      )}
      {playerRef.current != null && isPlaying && (
        <VideoControls
          player={playerRef.current}
          fullscreen={fullscreen}
          setFullscreen={(value: boolean) => setFullscreen(value)}
        />
      )}
      {!isPlaying && <VideoHeroOverlay handlePlay={handlePlay} />}
    </Box>
  )
}
