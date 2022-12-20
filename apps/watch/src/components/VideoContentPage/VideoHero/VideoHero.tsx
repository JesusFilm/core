import Box from '@mui/material/Box'
import { ReactElement, useRef, useEffect, useState } from 'react'
import videojs from 'video.js'
import { useVideo } from '../../../libs/videoContext'
import { VideoControls } from './VideoControls'
import { VideoHeroOverlay } from './VideoHeroOverlay'
import 'video.js/dist/video-js.css'

interface VideoHeroProps {
  onPlay: () => void
}

export function VideoHero({ onPlay }: VideoHeroProps): ReactElement {
  const { variant } = useVideo()
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()

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
          }
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
    onPlay()
    if (playerRef?.current != null) {
      playerRef?.current?.play()
    }
  }

  return (
    <Box
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
          display: 'none'
        },
        '> .video-js.vjs-fullscreen .vjs-control-bar': {
          display: 'flex'
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
        <VideoControls player={playerRef.current} />
      )}
      {!isPlaying && <VideoHeroOverlay handlePlay={handlePlay} />}
    </Box>
  )
}
