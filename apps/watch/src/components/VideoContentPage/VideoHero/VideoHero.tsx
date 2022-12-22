import Box from '@mui/material/Box'
import { ReactElement, useRef, useEffect, useState, useCallback } from 'react'
import videojs from 'video.js'
import fscreen from 'fscreen'
import Div100vh from 'react-div-100vh'
import { useVideo } from '../../../libs/videoContext'
import { Header } from '../../Header'
import { VideoControls } from './VideoControls'
import { VideoHeroOverlay } from './VideoHeroOverlay'

const VIDEO_HERO_BOTTOM_SPACING = 150
interface VideoHeroProps {
  onPlay?: () => void
}

export function VideoHero({ onPlay }: VideoHeroProps): ReactElement {
  const { variant } = useVideo()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()

  useEffect(() => {
    function fullscreenchange(): void {
      setIsFullscreen(fscreen.fullscreenElement != null)
    }

    fscreen.addEventListener('fullscreenchange', fullscreenchange)

    return () =>
      fscreen.removeEventListener('fullscreenchange', fullscreenchange)
  }, [setIsFullscreen])

  const handlePlay = useCallback((): void => {
    setIsPlaying(true)
    if (onPlay != null) {
      onPlay()
    }
    if (playerRef?.current != null) {
      playerRef?.current?.play()
    }
  }, [onPlay])

  useEffect(() => {
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        autoplay: false,
        controls: false,
        controlBar: false,
        bigPlayButton: false,
        userActions: {
          hotkeys: true,
          doubleClick: true
        },
        responsive: true
      })
      playerRef.current.on('play', handlePlay)
    }
  }, [variant, playerRef, videoRef, handlePlay])

  useEffect(() => {
    playerRef.current?.src({
      src: variant?.hls ?? '',
      type: 'application/x-mpegURL'
    })
    setIsPlaying(false)
  }, [variant?.hls])

  return (
    <>
      <Header hideAbsoluteAppBar={!controlsVisible} />
      <Div100vh
        css={{
          marginBottom: isFullscreen ? 0 : -VIDEO_HERO_BOTTOM_SPACING,
          paddingBottom: isFullscreen ? 0 : VIDEO_HERO_BOTTOM_SPACING
        }}
      >
        <Box
          sx={{
            background: 'black',
            position: 'relative',
            height: '100%',
            width: '100%',
            '.vjs-hidden': { display: 'none' },
            '.vjs-loading-spinner': { display: 'none' },
            '.vjs, .vjs-tech': {
              height: '100%',
              width: '100%'
            }
          }}
        >
          {variant?.hls != null && (
            <video className="vjs" ref={videoRef} playsInline />
          )}
          {playerRef.current != null && isPlaying && (
            <VideoControls
              player={playerRef.current}
              onVisibleChanged={(controlsVisible) =>
                setControlsVisible(controlsVisible)
              }
            />
          )}
          {!isPlaying && <VideoHeroOverlay handlePlay={handlePlay} />}
        </Box>
      </Div100vh>
    </>
  )
}
