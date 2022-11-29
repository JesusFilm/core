import { ReactElement, useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

import { GetVideo_video as Video } from '../../../../__generated__/GetVideo'
import { VideoHeroOverlay } from './VideoHeroOverlay'

interface VideoHeroProps {
  video: Video
}

export function VideoHero({ video }: VideoHeroProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const [isPlaying, setIsPlaying] = useState(false)
  const [muted, setMuted] = useState(false)

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
        muted: false,
        responsive: true,
        poster: video?.image ?? undefined
      })
      playerRef.current.on('play', handlePlay)
    }
  }, [video])

  function handleMute(): void {
    setMuted(!muted)
    playerRef.current?.muted(!muted)
  }

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
        <VideoHeroOverlay
          video={video}
          isMuted={muted}
          handleMute={handleMute}
          handlePlay={handlePlay}
        />
      )}
    </Box>
  )
}
