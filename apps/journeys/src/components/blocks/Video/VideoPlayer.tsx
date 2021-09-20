import videojs from 'video.js'
import React, { useEffect, useRef, useState } from 'react'
import { Container } from '@mui/material'
import { makeStyles, createStyles } from '@mui/styles'

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
      height: 'calc(100% - 30px)',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden'
    }
  })
)

interface IVideoPlayerProps {
  options: videojs.PlayerOptions
  onReady?: (player: undefined | videojs.Player) => void
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
  onReady,
  children
}) => {
  const classes = useStyles()
  const videoNode = useRef<HTMLVideoElement>(null)
  const player = useRef<videojs.Player>()
  const [isReady, setIsReady] = useState<boolean | undefined>()
  const [autoPlaySuccess, setAutoplaySuccess] = useState<boolean>(false)

  useEffect(() => {
    if (videoNode.current != null) {
      player.current = videojs(videoNode.current, {
        ...initialOptions,
        ...options
      })
      player.current.on('ready', () => {
        onReady?.(player.current)
        setIsReady(true)
      })
      player.current.on('autoplay-success', () => setAutoplaySuccess(true))
    }
  }, [options, videoNode, onReady])

  useEffect(() => {
    if (
      isReady === true &&
      initialOptions.autoplay === true &&
      !autoPlaySuccess &&
      navigator.userAgent.match(/Firefox/i) != null
    ) {
      player.current?.defaultMuted(true)
      player.current?.setAttribute('autoplay', '')
      player.current?.play()
    }
  }, [player, isReady, autoPlaySuccess])

  return (
    <Container className={classes.container}>
      <video ref={videoNode} className="video-js" />
      {children != null ? (
        <Container className={classes.overlayHolder}>
          {children as unknown as JSX.Element}
        </Container>
      ) : null}
    </Container>
  )
}
