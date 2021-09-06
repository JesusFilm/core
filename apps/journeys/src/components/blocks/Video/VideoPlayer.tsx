import videojs from 'video.js'
import React, { useEffect, useRef } from 'react'

import 'video.js/dist/video-js.css'

interface IVideoPlayerProps {
  options: videojs.PlayerOptions
}

const initialOptions: videojs.PlayerOptions = {
  autoplay: true,
  controls: true,
  userActions: {
    hotkeys: true,
    doubleClick: true
  },
  controlBar: {
    playToggle: true,
    captionsButton: true,
    chaptersButton: true,
    subtitlesButton: true,
    remainingTimeDisplay: true,
    progressControl: {
      seekBar: true
    },
    fullscreenToggle: true,
    playbackRateMenuButton: true,
    volumePanel: {
      inline: true
    }
  },
  sources: [
    {
      src: ''
    }
  ],
  fluid: true,
  responsive: true,
  playbackRates: [0.5, 1, 1.5, 2]
}

export const VideoPlayer: React.FC<IVideoPlayerProps> = ({ options }) => {
  const videoNode = useRef<HTMLVideoElement>(null)
  const player = useRef<videojs.Player>()

  useEffect(() => {
    if (videoNode.current != null) {
      player.current = videojs(videoNode.current, {
        ...initialOptions,
        ...options
      }).ready(() => {
        console.log('Ready', this)
      })
    }
    return () => {
      if (player.current != null) {
        player.current.dispose()
      }
    }
  }, [options])

  return <video ref={videoNode} className="video-js" />
}
