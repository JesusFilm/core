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

import { MuxInsertLogoOverlay , VideoControls } from './VideoControls'

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
  const playerRef = useRef<Player & { textTracks?: () => TextTrackList }>()
  const [player, setPlayer] = useState<
    Player & { textTracks?: () => TextTrackList }
  >()
  const [playerReady, setPlayerReady] = useState(false)

  useEffect(() => {
    // Reset player ready state when player initialization starts
    setPlayerReady(false)
  }, [variant, videoRef, title])

  useEffect(() => {
    if (videoRef.current != null) {
      // Dispose of existing player before creating a new one
      if (playerRef.current != null) {
        playerRef.current.dispose()
        playerRef.current = undefined
        setPlayer(undefined)
        setPlayerReady(false)
      }

      // Create Mux metadata for video analytics
      const muxMetadata: MuxMetadata = {
        env_key: process.env.NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY || '',
        player_name: 'watch',
        video_title: last(title)?.value ?? '',
        video_id: variant?.id ?? ''
      }

      const newPlayer = videojs(videoRef.current, {
        ...defaultVideoJsOptions,
        autoplay: true,
        controls: false,
        controlBar: false,
        bigPlayButton: false,
        userActions: {
          hotkeys: true,
          doubleClick: true
        },
        plugins: {
          mux: {
            debug: false,
            data: muxMetadata
          }
        }
      })

      newPlayer.ready(() => {
        setPlayerReady(true)
      })

      playerRef.current = newPlayer
      setPlayer(newPlayer)
    }

    // Cleanup function to dispose player when component unmounts or dependencies change
    return () => {
      if (playerRef.current != null) {
        playerRef.current.dispose()
        playerRef.current = undefined
        setPlayer(undefined)
        setPlayerReady(false)
      }
    }
  }, [variant?.id, variant?.hls, last(title)?.value])

  useEffect(() => {
    player?.src({
      src: variant?.hls ?? '',
      type: 'application/x-mpegURL'
    })
  }, [player, variant?.hls])

  const { subtitleUpdate } = useSubtitleUpdate()

  useEffect(() => {
    if (player == null || !playerReady || playerRef.current !== player) return

    void subtitleUpdate({ player, subtitleLanguageId, subtitleOn })
  }, [player, playerReady, subtitleLanguageId, subtitleOn, subtitleUpdate])

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
      <MuxInsertLogoOverlay variantId={variant?.id} />
    </>
  )
}
