import videojs from 'video.js'
import React, {
  ReactElement,
  useEffect,
  useRef,
  useState,
  useCallback
} from 'react'
import { Container } from '@mui/material'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { v4 as uuidv4 } from 'uuid'
import { useMutation, gql } from '@apollo/client'
import { VideoResponseCreate } from '../../../../__generated__/VideoResponseCreate'
import { VideoResponseStateEnum } from '../../../../__generated__/globalTypes'
import { Trigger } from '../Trigger'
import {
  isActiveBlockOrDescendant,
  useBlocks
} from '../../../libs/client/cache/blocks'

import 'video.js/dist/video-js.css'

export const VIDEO_RESPONSE_CREATE = gql`
  mutation VideoResponseCreate($input: VideoResponseCreateInput!) {
    videoResponseCreate(input: $input) {
      id
      state
      position
    }
  }
`

interface VideoProps extends TreeBlock<VideoBlock> {
  uuid?: () => string
}

export function Video({
  id: blockId,
  videoContent,
  autoplay,
  startAt,
  muted,
  uuid = uuidv4,
  children
}: VideoProps): ReactElement {
  const videoNode = useRef<HTMLVideoElement>(null)
  const [videoResponseCreate] = useMutation<VideoResponseCreate>(
    VIDEO_RESPONSE_CREATE
  )
  const player = useRef<videojs.Player>()
  const { activeBlock } = useBlocks()

  const [isPlaying, setIsPlaying] = useState<boolean | string>()
  const [isReady, setIsReady] = useState<boolean | undefined>()
  const [autoPlaySuccess, setAutoplaySuccess] = useState<boolean>(false)

  const handleVideoResponse = useCallback(
    async (
      videoState: VideoResponseStateEnum,
      videoPosition: number | null
    ): Promise<void> => {
      const id = uuid()
      await videoResponseCreate({
        variables: {
          input: {
            id,
            blockId,
            state: videoState,
            position: videoPosition
          }
        },
        optimisticResponse: {
          videoResponseCreate: {
            id,
            __typename: 'VideoResponse',
            state: videoState,
            position: videoPosition
          }
        }
      })
    },
    [blockId, uuid, videoResponseCreate]
  )

  const validatePlaying = useCallback(() => {
    if (autoplay != null && muted != null) {
      if (isActiveBlockOrDescendant(blockId) && muted) {
        setIsPlaying('muted')
      } else if (isActiveBlockOrDescendant(blockId)) {
        setIsPlaying(autoplay)
      }
    }
  }, [blockId, autoplay, muted])

  // get the redirected URL link to use for stories (storybook)
  // take the comment out on console log to use
  // console.log(videoContent?.src)

  useEffect(() => {
    validatePlaying()

    if (isPlaying !== undefined && videoContent != null) {
      const initialOptions: videojs.PlayerOptions = {
        autoplay: isPlaying,
        controls: true,
        userActions: {
          hotkeys: true,
          doubleClick: true
        },
        controlBar: {
          playToggle: true,
          captionsButton: true,
          subtitlesButton: true,
          remainingTimeDisplay: true,
          progressControl: {
            seekBar: true
          },
          fullscreenToggle: true,
          volumePanel: {
            inline: true
          }
        },
        sources: [
          {
            src: videoContent.src
          }
        ],
        fluid: true,
        responsive: true
      }

      if (videoNode.current != null) {
        player.current = videojs(videoNode.current, {
          ...initialOptions
        })
        player.current.on('ready', () => {
          setIsReady(true)
          startAt !== null && player.current?.currentTime(startAt)
        })
        player.current.on('playing', () => {
          player.current !== undefined &&
            handleVideoResponse(
              VideoResponseStateEnum.PLAYING,
              player.current.currentTime()
            )
        })
        player.current.on('pause', () => {
          player.current !== undefined &&
            handleVideoResponse(
              VideoResponseStateEnum.PAUSED,
              player.current.currentTime()
            )
        })
        player.current.on('ended', () => {
          if (player.current !== undefined) {
            void handleVideoResponse(
              VideoResponseStateEnum.FINISHED,
              player.current?.currentTime()
            )

            if (player.current.isFullscreen()) {
              player.current.exitFullscreen()
            }
          }
        })
        player.current.on('autoplay-success', () => setAutoplaySuccess(true))
      }
    }
  }, [
    videoNode,
    activeBlock,
    children,
    autoplay,
    videoContent,
    isPlaying,
    validatePlaying,
    handleVideoResponse,
    startAt
  ])

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
    <Container maxWidth="md">
      <video ref={videoNode} className="video-js" data-testid="VideoComponent">
        {children?.map(
          (option) =>
            option.__typename === 'VideoTriggerBlock' && (
              <Trigger player={player.current} {...option} />
            )
        )}
      </video>
    </Container>
  )
}
