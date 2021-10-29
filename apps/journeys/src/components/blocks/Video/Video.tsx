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
import { useBlocks } from '../../../libs/client/cache/blocks'

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

function flatten(node: TreeBlock, parent?: TreeBlock) {
  const nodes = [{ id: node.id, parent: parent?.id, __typename: node.__typename }]

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      nodes.push(...flatten(child, node))
    }
  } else if (typeof node.children === 'object') {
    nodes.push(...flatten(node.children, node))
  }

  return nodes
}

export function Video({
  id: blockId,
  mediaComponentId,
  languageId,
  videoSrc,
  autoplay,
  startAt,
  uuid = uuidv4,
  children
}: VideoProps): ReactElement {
  const videoNode = useRef<HTMLVideoElement>(null)
  const [videoResponseCreate] = useMutation<VideoResponseCreate>(
    VIDEO_RESPONSE_CREATE
  )
  const player = useRef<videojs.Player>()
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const arclightURL = `https://arc.gt/hls/${mediaComponentId}/${languageId}`
  const { activeBlock } = useBlocks()

  const [videoUrl, setVideoUrl] = useState<string | undefined>()
  const [isReady, setIsReady] = useState<boolean | undefined>()
  const [isAutoplay, setAutoplay] = useState<boolean | string>()
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

  const validate = useCallback(
    async (
      url: string,
      src: string | null,
      // autoplay: boolean | null
    ): Promise<void> => {
      if (mediaComponentId === undefined || languageId === undefined) {
        src !== null && setVideoUrl(src)
      } else {
        await fetch(url).then((response) => setVideoUrl(response.url))
      }

      if (activeBlock != null) {
        const descendants = flatten(activeBlock)
        const videoBlock = descendants.find((block) => block.__typename === 'VideoBlock')
        // This still affects all the video
        if (videoBlock != null)
          setAutoplay('muted')
      }
    },
    [languageId, mediaComponentId, activeBlock]
  )

  useEffect(() => {
    void validate(arclightURL, videoSrc)

    console.log(isAutoplay)

    if (videoUrl !== undefined && isAutoplay !== undefined) {
      const initialOptions: videojs.PlayerOptions = {
        autoplay: isAutoplay,
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
          volumePanel: {
            inline: true
          }
        },
        sources: [
          {
            src: videoUrl
          }
        ],
        fluid: true,
        responsive: true,
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
          player.current !== undefined && handleVideoResponse(VideoResponseStateEnum.PLAYING, player.current.currentTime())
        })
        player.current.on('pause', () => {
          player.current !== undefined &&
            handleVideoResponse(
              VideoResponseStateEnum.PAUSED,
              player.current.currentTime()
            )
        })
        player.current.on('ended', () => {
          player.current !== undefined &&
            handleVideoResponse(
              VideoResponseStateEnum.FINISHED,
              player.current?.currentTime()
            )
        })
        player.current.on('autoplay-success', () => setAutoplaySuccess(true))
      }
    }
  }, [
    videoNode,
    isAutoplay,
    activeBlock,
    children,
    videoSrc,
    validate,
    handleVideoResponse,
    videoUrl,
    arclightURL,
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
            option.__typename === 'TriggerBlock' && (
              <Trigger player={player.current} {...option} />
            )
        )}
      </video>
    </Container>
  )
}
