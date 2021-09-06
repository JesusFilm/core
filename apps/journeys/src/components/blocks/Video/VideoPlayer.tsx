import videojs from 'video.js'
import React, { useEffect, useRef } from 'react'
import { Container, makeStyles, createStyles } from '@material-ui/core'

import 'video.js/dist/video-js.css'

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      position: 'relative',
      overflow: 'hidden'
    },
    overlayHolder: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden'
    }
  })
)

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

export const VideoPlayer: React.FC<IVideoPlayerProps> = ({
  options,
  children
}) => {
  const classes = useStyles()
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

  return (
    <Container className={classes.container}>
      <video ref={videoNode} className="video-js" />
      <Container className={classes.overlayHolder}>{children}</Container>
    </Container>
  )
}
