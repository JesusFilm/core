import videojs from 'video.js'
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { Container } from '@mui/material'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'

import 'video.js/dist/video-js.css'

export function Video({ src, autoplay }: TreeBlock<VideoBlock>): ReactElement {
  const videoNode = useRef<HTMLVideoElement>(null)
  const player = useRef<videojs.Player>()
  const [isReady, setIsReady] = useState<boolean | undefined>()
  const [autoPlaySuccess, setAutoplaySuccess] = useState<boolean>(false)

  useEffect(() => {
    const initialOptions: videojs.PlayerOptions = {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      autoplay: autoplay ? 'muted' : false,
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
          src: src
        }
      ],
      fluid: true,
      responsive: true,
      playbackRates: [0.5, 1, 1.5, 2]
    }

    if (videoNode.current != null) {
      player.current = videojs(videoNode.current, {
        ...initialOptions
      })
      player.current.on('ready', () => {
        setIsReady(true)
      })
      player.current.on('autoplay-success', () => setAutoplaySuccess(true))
    }
  }, [videoNode, src, autoplay])

  useEffect(() => {
    if (
      isReady === true &&
      autoplay === true &&
      !autoPlaySuccess &&
      navigator.userAgent.match(/Firefox/i) != null
    ) {
      player.current?.defaultMuted(true)
      player.current?.setAttribute('autoplay', '')
      player.current?.play()
    }
  }, [player, isReady, autoPlaySuccess, autoplay])

  return (
    <Container
      data-testid="VideoComponent"
      maxWidth="md"
    >
      <video ref={videoNode} className="video-js" />
    </Container>
  )
}
