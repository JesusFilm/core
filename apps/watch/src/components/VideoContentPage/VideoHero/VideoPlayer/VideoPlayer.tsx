import { ReactElement, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import { useVideo } from '../../../../libs/videoContext'

import { VideoControls } from './VideoControls'

interface VideoPlayerProps {
  languageId: string
  setControlsVisible: (visible: boolean) => void
}

export function VideoPlayer({
  setControlsVisible,
  languageId
}: VideoPlayerProps): ReactElement {
  const { variant } = useVideo()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [player, setPlayer] = useState<Player>()

  useEffect(() => {
    if (videoRef.current != null) {
      setPlayer(
        videojs(videoRef.current, {
          ...defaultVideoJsOptions,
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
          languageId={languageId}
          player={player}
          onVisibleChanged={(controlsVisible) =>
            setControlsVisible(controlsVisible)
          }
        />
      )}
    </>
  )
}
