import last from 'lodash/last'
import { ReactElement, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import { MuxMetadata } from '@core/shared/ui/muxMetadataType'

import 'videojs-mux'

import { useVideo } from '../../../../libs/videoContext'
import { useWatch } from '../../../../libs/watchContext'

import { VideoControls } from './VideoControls'

interface VideoPlayerProps {
  setControlsVisible: (visible: boolean) => void
}

export function VideoPlayer({
  setControlsVisible
}: VideoPlayerProps): ReactElement {
  const { variant, title } = useVideo()
  const {
    state: {
      subtitleLanguage,
      subtitleOn,
      currentSubtitleOn,
      videoSubtitleLanguages
    }
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

  useEffect(() => {
    if (player == null) return

    const tracks = player.textTracks?.() ?? []

    // Use currentSubtitleOn if available (based on availability), otherwise fall back to user preference
    const shouldShowSubtitles = currentSubtitleOn ?? subtitleOn

    if (!shouldShowSubtitles || subtitleLanguage == null) {
      // Disable all subtitle tracks when subtitles should be off
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i]
        if (track.kind === 'subtitles') {
          track.mode = 'disabled'
        }
      }
      return
    }

    const selected = videoSubtitleLanguages?.find(
      (subtitle) => subtitle.language.id === subtitleLanguage
    )

    if (selected == null) return

    // Check if track with this ID already exists
    let existingTrack: TextTrack | null = null
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i]
      if (track.id === subtitleLanguage) {
        existingTrack = track
        break
      }
    }

    // If track doesn't exist, add it
    if (existingTrack == null) {
      player.addRemoteTextTrack(
        {
          id: subtitleLanguage,
          src: selected.value,
          kind: 'subtitles',
          language:
            selected.language.bcp47 === null
              ? undefined
              : selected.language.bcp47,
          label: selected.language.name.map((name) => name.value).join(', '),
          mode: 'showing',
          default: true
        },
        true
      )
    }

    // Update track modes: show selected language, disable others
    const updatedTracks = player.textTracks?.() ?? []
    for (let i = 0; i < updatedTracks.length; i++) {
      const track = updatedTracks[i]
      if (track.kind === 'subtitles') {
        if (track.id === subtitleLanguage) {
          track.mode = 'showing'
        } else {
          track.mode = 'disabled'
        }
      }
    }
  }, [
    player,
    videoSubtitleLanguages,
    subtitleLanguage,
    subtitleOn,
    currentSubtitleOn
  ])

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
