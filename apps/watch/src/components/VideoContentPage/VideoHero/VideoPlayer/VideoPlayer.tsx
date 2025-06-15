import { useQuery } from '@apollo/client'
import last from 'lodash/last'
import { ReactElement, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import { MuxMetadata } from '@core/shared/ui/muxMetadataType'

import 'videojs-mux'

import { GetSubtitles } from '../../../../../__generated__/GetSubtitles'
import { useVideo } from '../../../../libs/videoContext'
import { getCookie } from '../../../LanguageSwitchDialogNew/utils/cookieHandler'
import { GET_SUBTITLES } from '../../../SubtitleDialog/SubtitleDialog'

import { VideoControls } from './VideoControls'

interface VideoPlayerProps {
  setControlsVisible: (visible: boolean) => void
}

export function VideoPlayer({
  setControlsVisible
}: VideoPlayerProps): ReactElement {
  const { variant, title } = useVideo()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [player, setPlayer] = useState<
    Player & { textTracks?: () => TextTrackList }
  >()

  const { loading, data } = useQuery<GetSubtitles>(GET_SUBTITLES, {
    variables: {
      id: variant?.slug
    }
  })

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
    const subtitleLanguageId = getCookie('SUBTITLE_LANGUAGE')
    const subtitlesOn = getCookie('SUBTITLES_ON') === 'true'

    if (player == null || !subtitlesOn || subtitleLanguageId == null || loading)
      return

    const selected = data?.video?.variant?.subtitle?.find(
      (subtitle) => subtitle.language.id === subtitleLanguageId
    )

    player.addRemoteTextTrack(
      {
        id: subtitleLanguageId,
        src: selected?.value,
        kind: 'subtitles',
        language:
          selected?.language.bcp47 === null
            ? undefined
            : selected?.language.bcp47,
        label: selected?.language.name.map((name) => name.value).join(', '),
        mode: 'showing',
        default: true
      },
      true
    )
    const tracks = player.textTracks?.() ?? []

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i]
      if (track.id === subtitleLanguageId) {
        track.mode = 'showing'
      } else {
        track.mode = 'disabled'
      }
    }
  }, [player, data, loading])

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
