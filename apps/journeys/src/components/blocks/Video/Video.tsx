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
import { findIndex } from 'lodash'

import 'video.js/dist/video-js.css'

export const VIDEO_RESPONSE_CREATE = gql`
  mutation VideoResponseCreate($input: VideoResponseCreateInput!) {
    videoResponseCreate(input: $input) {
      id
      state
    }
  }
`

interface VideoProps extends TreeBlock<VideoBlock> {
  uuid?: () => string
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
  const { treeBlocks, activeBlock } = useBlocks()

  const [videoUrl, setVideoUrl] = useState<string | undefined>()
  const [isReady, setIsReady] = useState<boolean | undefined>()
  const [isAutoplay, setAutoplay] = useState<boolean | undefined>()
  const [autoPlaySuccess, setAutoplaySuccess] = useState<boolean>(false)

  const handleVideoResponse = useCallback(
    async (videoState: VideoResponseStateEnum): Promise<void> => {
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
    },
    [blockId, uuid, videoResponseCreate]
  )

  const validate = useCallback(
    async (
      url: string,
      src: string | null,
      autoplay: boolean | null
    ): Promise<void> => {
      if (mediaComponentId === undefined || languageId === undefined) {
        src !== null && setVideoUrl(src)
      } else {
        await fetch(url).then((response) => setVideoUrl(response.url))
      }

      const index = findIndex(
        treeBlocks,
        (treeBlock) => treeBlock.id === activeBlock?.id
      )

      // have a logic here saying if it's not the active block don't auto play
      // so something like if active setAutoplay true else setAutoplay false
      if (activeBlock?.id === treeBlocks[index].id) {
        console.log('active ' + activeBlock?.id)
        if (autoplay !== null) {
          setAutoplay(autoplay)
        }
      } else {
        console.log('I am not active')
      }
    },
    [languageId, mediaComponentId, activeBlock, treeBlocks]
  )

  useEffect(() => {
    void validate(arclightURL, videoSrc, autoplay)

    if (videoUrl !== undefined) {
      const initialOptions: videojs.PlayerOptions = {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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
          playbackRateMenuButton: true,
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
        playbackRates: [0.5, 1, 1.5, 2]
      }

      // console.log(`${activeBlock.id} wahaha ${isAutoplay}`)

      if (videoNode.current != null) {
        player.current = videojs(videoNode.current, {
          ...initialOptions
        })
        player.current.on('ready', () => {
          setIsReady(true)
          startAt !== null && player.current?.currentTime(startAt)
        })
        player.current.on('playing', () => {
          void handleVideoResponse(VideoResponseStateEnum.PLAYING)
        })
        player.current.on('pause', () => {
          void handleVideoResponse(VideoResponseStateEnum.PAUSED)
        })
        player.current.on('ended', () => {
          void handleVideoResponse(VideoResponseStateEnum.FINISHED)
        })
        player.current.on('timeupdate', () => {
          // TODO: figure out how we want to record video response
          if (player.current !== undefined)
            player.current.paused() &&
              handleVideoResponse(VideoResponseStateEnum.SECONDSWATCHED)
        })
        player.current.on('autoplay-success', () => setAutoplaySuccess(true))
      }
    }
  }, [
    videoNode,
    isAutoplay,
    autoplay,
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
