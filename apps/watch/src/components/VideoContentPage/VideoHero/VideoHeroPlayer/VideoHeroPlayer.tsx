import { MutableRefObject, ReactElement, RefObject, useEffect } from 'react'
import videojs from 'video.js'

import { useVideo } from '../../../../libs/videoContext'

interface VideoHeroPlayerProps {
  videoRef: RefObject<HTMLVideoElement>
  playerRef: MutableRefObject<videojs.Player | undefined>
  playVideo: () => void
}

export function VideoHeroPlayer({
  videoRef,
  playerRef,
  playVideo
}: VideoHeroPlayerProps): ReactElement {
  const { variant } = useVideo()

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
          remainingTimeDisplay: true,
          progressControl: {
            seekBar: true
          },
          fullscreenToggle: true,
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
        responsive: true
      })
      playerRef.current.on('play', playVideo)
    }
  }, [playerRef, videoRef, playVideo])

  return (
    <>
      {variant?.hls != null && (
        <video
          ref={videoRef}
          id="vjs-jfp"
          className="vjs-jfp video-js vjs-fill"
          style={{
            alignSelf: 'center',
            position: 'absolute'
          }}
          playsInline
        >
          <source src={variant.hls} type="application/x-mpegURL" />
        </video>
      )}
    </>
  )
}
