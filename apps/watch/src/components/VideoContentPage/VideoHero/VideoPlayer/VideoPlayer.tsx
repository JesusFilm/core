import last from 'lodash/last'
import { ReactElement, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import { MuxMetadata } from '@core/shared/ui/muxMetadataType'

import 'videojs-mux'

import { useVideo } from '../../../../libs/videoContext'
import { useWatch } from '../../../../libs/watchContext'
import { useSubtitleUpdate } from '../../../../libs/watchContext/useSubtitleUpdate'

import { VideoControls } from './VideoControls'

interface VideoPlayerProps {
  setControlsVisible: (visible: boolean) => void
}

export function VideoPlayer({
  setControlsVisible
}: VideoPlayerProps): ReactElement {
  const { variant, title } = useVideo()
  const {
    state: { subtitleLanguageId, subtitleOn }
  } = useWatch()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [player, setPlayer] = useState<
    Player & { textTracks?: () => TextTrackList }
  >()

  useEffect(() => {
    if (videoRef.current != null) {
      // Create Mux metadata for video analytics
      const muxMetadata: MuxMetadata = {
        env_key: process.env.NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY || '',
        player_name: 'watch',
        video_title: last(title)?.value ?? '',
        video_id: variant?.id ?? ''
      }

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
          responsive: true,
          plugins: {
            mux: {
              debug: false,
              data: muxMetadata
            }
          }
        })
      )
    }
  }, [variant, videoRef, title])

  useEffect(() => {
    player?.src({
      src: variant?.hls ?? '',
      type: 'application/x-mpegURL'
    })
  }, [player, variant?.hls])

  const { subtitleUpdate } = useSubtitleUpdate()

  useEffect(() => {
    if (player == null) return

    void subtitleUpdate({ player, subtitleLanguageId, subtitleOn })
  }, [player, subtitleLanguageId, subtitleOn])

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
