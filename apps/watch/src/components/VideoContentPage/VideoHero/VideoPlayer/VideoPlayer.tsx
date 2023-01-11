import { ReactElement, useRef, useEffect, useState } from 'react'
import videojs, { VideoJsPlayer } from 'video.js'
import { useVideo } from '../../../../libs/videoContext'
import { VideoControls } from './VideoControls'

interface VideoPlayerProps {
  setControlsVisible: (visible: boolean) => void
}

export function VideoPlayer({
  setControlsVisible
}: VideoPlayerProps): ReactElement {
  const { variant } = useVideo()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [player, setPlayer] = useState<VideoJsPlayer>()

  useEffect(() => {
    if (videoRef.current != null) {
      setPlayer(
        videojs(videoRef.current, {
          autoplay: true,
          controls: false,
          controlBar: false,
          bigPlayButton: false,
          userActions: {
            hotkeys: true,
            doubleClick: true
          },
          responsive: true
        })
      )
    }
  }, [variant, videoRef])

  useEffect(() => {
    player?.src({
      src: variant?.hls ?? '',
      type: 'application/x-mpegURL'
    })
  }, [player, variant?.hls])

  return (
    <>
      {variant?.hls != null && (
        <video className="vjs" ref={videoRef} playsInline />
      )}
      {player != null && (
        <VideoControls
          player={player}
          onVisibleChanged={(controlsVisible) =>
            setControlsVisible(controlsVisible)
          }
        />
      )}
    </>
  )
}
