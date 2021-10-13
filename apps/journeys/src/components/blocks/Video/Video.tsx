import videojs from 'video.js'
import React, { ReactElement, useEffect, useRef, useState, useCallback } from 'react'
import { Container } from '@mui/material'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { v4 as uuidv4 } from 'uuid'
import { useMutation, gql } from '@apollo/client'
import { VideoResponseCreate } from '../../../../__generated__/VideoResponseCreate'
import { VideoResponseStateEnum } from '../../../../__generated__/globalTypes'

import 'video.js/dist/video-js.css'

export const VIDEO_RESPONSE_CREATE = gql`
  mutation VideoResponseCreate(
    $input: VideoResponseCreateInput!
  ) {
    videoResponseCreate(input: $input) {
      id,
      state
    }
  }
`

interface VideoProps extends TreeBlock<VideoBlock> {
  uuid?: () => string
}

export function Video({ id: blockId, mediaComponentId, languageId, autoplay, uuid = uuidv4 }: VideoProps): ReactElement {
  const videoNode = useRef<HTMLVideoElement>(null)
  const [videoResponseCreate] = useMutation<VideoResponseCreate>(VIDEO_RESPONSE_CREATE)

  const player = useRef<videojs.Player>()
  const [isReady, setIsReady] = useState<boolean | undefined>()
  const [autoPlaySuccess, setAutoplaySuccess] = useState<boolean>(false)

  const handleVideoState = useCallback(async (videoState: VideoResponseStateEnum): Promise<void> => {
    const id = uuid()
    await videoResponseCreate({
      variables: {
        input: {
          id,
          blockId,
          state: videoState
        }
      },
      optimisticResponse: {
        videoResponseCreate: {
          id,
          __typename: 'VideoResponse',
          state: videoState
        }
      }
    })
  }, [blockId, uuid, videoResponseCreate])

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
          // src: `https://arc.gt/hls/${mediaComponentId}/${languageId}`
          src: `https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8`
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
      player.current.on('playing', () => {
        void handleVideoState(VideoResponseStateEnum.PLAYING)
      })
      player.current.on('pause', () => {
        void handleVideoState(VideoResponseStateEnum.PAUSED)
      })
      player.current.on('ended', () => {
        void handleVideoState(VideoResponseStateEnum.FINISHED)
      })
      player.current.on('autoplay-success', () => setAutoplaySuccess(true))
    }
  }, [videoNode, autoplay, mediaComponentId, languageId, handleVideoState])

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
    <Container data-testid="VideoComponent" maxWidth="md">
      <video ref={videoNode} className="video-js" />
    </Container>
  )
}
