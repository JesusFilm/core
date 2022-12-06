import { ReactElement, RefObject, useEffect, useRef } from 'react'

import videojs from 'video.js'
import 'video.js/dist/video-js.css'
// import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded'

import { VideoContentFields } from '../../../../../__generated__/VideoContentFields'

interface VideoHeroPlayerProps {
  video: VideoContentFields
  videoRef: RefObject<HTMLVideoElement>
  playVideo: () => void
  pauseVideo: () => void
}

export function VideoHeroPlayer({
  video,
  videoRef,
  playVideo,
  pauseVideo
}: VideoHeroPlayerProps): ReactElement {
  const playerRef = useRef<videojs.Player>()

  const Button = videojs.getComponent('Button')

  class AudioControl extends Button {
    constructor(player, options) {
      super(player, options)
      this.addClass('vjs-audio-button')
      this.controlText(player.localize('Audio Language'))
    }

    handleClick(): void {
      alert('open Audio Dialog')
    }
  }

  class SubtitleControl extends Button {
    constructor(player, options) {
      super(player, options)
      this.addClass('vjs-subtitles-button')
      this.controlText(player.localize('Subtitle'))
    }

    handleClick(): void {
      alert('open Subtitle Dialog')
    }
  }

  videojs.registerComponent('audioControl', AudioControl)
  videojs.registerComponent('subtitleControl', SubtitleControl)

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
          captionsButton: false,
          subtitlesButton: false,
          remainingTimeDisplay: true,
          progressControl: {
            seekBar: true
          },
          fullscreenToggle: true,
          pictureInPictureToggle: false,
          volumePanel: {
            inline: false
          },
          children: [
            'playToggle',
            'progressControl',
            'remainingTimeDisplay',
            'volumePanel',
            'audioControl',
            'subtitleControl',
            'fullscreenToggle'
          ]
        },
        responsive: true,
        poster: video?.image ?? undefined
      })
      playerRef.current.on('play', playVideo)
      // playerRef.current.on('pause', pauseVideo)
    }
  }, [playerRef, video, videoRef, playVideo])

  return (
    <>
      {video?.variant?.hls != null && (
        <video
          ref={videoRef}
          className="vjs-jfp video-js vjs-fill"
          style={{
            alignSelf: 'center'
          }}
          playsInline
        >
          <source src={video.variant.hls} type="application/x-mpegURL" />
        </video>
      )}
    </>
  )
}
