import videojs from 'video.js'
import React, { ReactElement, useEffect, useRef, useCallback } from 'react'
import { Box } from '@mui/material'
import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/TreeBlock'
import { v4 as uuidv4 } from 'uuid'
import { useMutation, gql } from '@apollo/client'
import { VideoResponseCreate } from '../../../../__generated__/VideoResponseCreate'
import { VideoResponseStateEnum } from '../../../../__generated__/globalTypes'
import { Trigger } from './VideoTrigger'

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
  posterBlockId,
  uuid = uuidv4,
  children
}: VideoProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const posterBlock = children.find(
    (block) => block.id === posterBlockId && block.__typename === 'ImageBlock'
  ) as TreeBlock<ImageBlock> | undefined
  const [videoResponseCreate] = useMutation<VideoResponseCreate>(
    VIDEO_RESPONSE_CREATE
  )

  const handleVideoResponse = useCallback(
    (videoState: VideoResponseStateEnum, videoPosition?: number): void => {
      const id = uuid()
      const position = videoPosition != null ? Math.floor(videoPosition) : 0

      void videoResponseCreate({
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
        autoplay: autoplay === true,
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
        muted: muted === true,
        poster: posterBlock?.src
      })
      playerRef.current.on('ready', () => {
        playerRef.current?.currentTime(startAt ?? 0)
      })
      playerRef.current.on('playing', () => {
        handleVideoResponse(
          VideoResponseStateEnum.PLAYING,
          playerRef.current?.currentTime()
        )
      })
      playerRef.current.on('pause', () => {
        handleVideoResponse(
          VideoResponseStateEnum.PAUSED,
          playerRef.current?.currentTime()
        )
      })
      playerRef.current.on('ended', () => {
        if (playerRef?.current?.isFullscreen() === true)
          playerRef.current?.exitFullscreen()
        handleVideoResponse(
          VideoResponseStateEnum.FINISHED,
          playerRef.current?.currentTime()
        )
      })
    }
  }, [handleVideoResponse, startAt, muted, autoplay, blockId, posterBlock])

  return (
    <Box
      data-testid="VideoComponent"
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        borderRadius: 4,
        overflow: 'hidden',
        m: 0
      }}
    >
      <video
        ref={videoRef}
        className="video-js"
        style={{ display: 'flex', alignSelf: 'center', height: '100%' }}
      >
        <source
          src={videoContent.src}
          type={
            videoContent.__typename === 'VideoArclight'
              ? 'application/x-mpegURL'
              : undefined
          }
        />
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
