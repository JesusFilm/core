import { ReactElement, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import { MuxMetadata } from '@core/shared/ui/muxMetadataType'

import 'videojs-mux'

import { useVideo } from '../../../../libs/videoContext'

import { VideoControls } from './VideoControls'

interface VideoPlayerProps {
  setControlsVisible: (visible: boolean) => void
  autoplay?: boolean
  muted?: boolean
  showControls?: boolean
}

export function VideoPlayer({
  setControlsVisible,
  autoplay = false,
  muted = false,
  showControls = true
}: VideoPlayerProps): ReactElement {
  const { variant, title } = useVideo()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [player, setPlayer] = useState<Player>()

  useEffect(() => {
    if (videoRef.current != null) {
      // Create Mux metadata for video analytics
      const muxMetadata: MuxMetadata = {
        env_key: process.env.NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY || '',
        player_name: 'watch',
        video_title: title?.[0]?.value ?? '',
        video_id: variant?.id ?? ''
      }

      setPlayer(
        videojs(videoRef.current, {
          ...defaultVideoJsOptions,
          autoplay: autoplay,
          muted: muted,
          controls: false,
          controlBar: false,
          bigPlayButton: false,
          userActions: {
            hotkeys: true,
            doubleClick: true
          },
          responsive: true,
          fill: true,
          plugins: {
            mux: {
              debug: false,
              data: muxMetadata
            }
          }
        })
      )
    }
  }, [variant, videoRef, autoplay, muted, title])

  useEffect(() => {
    if (player) {
      player.src({
        src: variant?.hls ?? '',
        type: 'application/x-mpegURL'
      })

      // Update player state when autoplay or muted changes
      player.autoplay(autoplay)
      player.muted(muted)
    }
  }, [player, variant?.hls, autoplay, muted])

  return (
    <div className="absolute inset-0">
      {variant?.hls != null && (
        <video
          className="vjs w-full h-full object-cover"
          ref={videoRef}
          playsInline
        />
      )}
      {player != null && showControls && !muted && (
        <VideoControls
          player={player}
          onVisibleChanged={(controlsVisible) =>
            setControlsVisible(controlsVisible)
          }
        />
      )}
    </div>
  )
}
