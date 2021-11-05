import videojs from 'video.js'
import React, {
  ReactElement,
  useEffect,
  useRef,
  useState,
  useCallback
} from 'react'
import { Box } from '@mui/material'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { v4 as uuidv4 } from 'uuid'
import { useMutation, gql } from '@apollo/client'
import { VideoResponseCreate } from '../../../../__generated__/VideoResponseCreate'
import { VideoResponseStateEnum } from '../../../../__generated__/globalTypes'
import { Trigger } from './VideoTrigger'
import { isActiveBlockOrDescendant } from '../../../libs/client/cache/blocks'

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
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const [videoResponseCreate] = useMutation<VideoResponseCreate>(
    VIDEO_RESPONSE_CREATE
  )

  const handleVideoResponse = useCallback(
    async (
      videoState: VideoResponseStateEnum,
      videoPosition?: number
    ): Promise<void> => {
      const id = uuid()
      const position = videoPosition != null ? Math.floor(videoPosition) : 0

      await videoResponseCreate({
        variables: {
          input: {
            id,
            blockId,
            state: videoState,
            position
          }
        },
        optimisticResponse: {
          videoResponseCreate: {
            id,
            __typename: 'VideoResponse',
            state: videoState,
            position
          }
        }
      })
    },
    [blockId, uuid, videoResponseCreate]
  )

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
        fluid: true,
        responsive: true,
        muted: muted === true
      })
      playerRef.current.on('ready', () => {
        playerRef.current?.currentTime(startAt ?? 0)
      })
      playerRef.current.on('playing', () => {
        void handleVideoResponse(
          VideoResponseStateEnum.PLAYING,
          playerRef.current?.currentTime()
        )
      })
      playerRef.current.on('pause', () => {
        void handleVideoResponse(
          VideoResponseStateEnum.PAUSED,
          playerRef.current?.currentTime()
        )
      })
      playerRef.current.on('ended', () => {
        playerRef.current?.exitFullscreen()
        void handleVideoResponse(
          VideoResponseStateEnum.FINISHED,
          playerRef.current?.currentTime()
        )
      })
    }
  }, [handleVideoResponse, startAt, muted])

  useEffect(() => {
    if (autoplay === true && isActiveBlockOrDescendant(blockId)) {
      playerRef.current?.play()
    }
  }, [autoplay, blockId, playerRef])

  return (
    <Box
      data-testid="VideoComponent"
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        borderRadius: 4,
        overflow: 'hidden'
      }}
    >
      <video
        ref={videoRef}
        className="video-js"
        style={{ display: 'flex', alignSelf: 'center' }}
      >
        <source src={videoContent.src} />
      </video>
      {children?.map(
        (option) =>
          option.__typename === 'VideoTriggerBlock' && (
            <Trigger player={playerRef.current} {...option} />
          )
      )}
    </Box>
  )
}
