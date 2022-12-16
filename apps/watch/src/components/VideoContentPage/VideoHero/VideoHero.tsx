import { ReactElement, useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

import { useVideo } from '../../../libs/videoContext'
import { VideoHeroOverlay } from './VideoHeroOverlay'

export function VideoHero(): ReactElement {
  const { variant } = useVideo()
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
        responsive: true
      })
      playerRef.current.on('play', handlePlay)
    }
  })

  function handlePlay(): void {
    setIsPlaying(true)
    playerRef?.current?.play()
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
        >
          <source src={variant.hls} type="application/x-mpegURL" />
        </video>
      )}
      {!isPlaying && <VideoHeroOverlay handlePlay={handlePlay} />}
    </Box>
  )
}
