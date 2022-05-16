import { gql, useMutation } from '@apollo/client'
import { ReactElement, useEffect } from 'react'
import videojs from 'video.js'
import { v4 as uuidv4 } from 'uuid'
import { VideoStartEventCreate } from './__generated__/VideoStartEventCreate'
import { VideoPlayEventCreate } from './__generated__/VideoPlayEventCreate'
import { VideoPauseEventCreate } from './__generated__/VideoPauseEventCreate'
import { VideoCompleteEventCreate } from './__generated__/VideoCompleteEventCreate'

export const VIDEO_START_EVENT_CREATE = gql`
  mutation VideoStartEventCreate($input: VideoStartEventCreateInput!) {
    videoStartEventCreate(input: $input) {
      id
    }
  }
`
export const VIDEO_PLAY_EVENT_CREATE = gql`
  mutation VideoPlayEventCreate($input: VideoPlayEventCreateInput!) {
    videoPlayEventCreate(input: $input) {
      id
    }
  }
`
export const VIDEO_PAUSE_EVENT_CREATE = gql`
  mutation VideoPauseEventCreate($input: VideoPauseEventCreateInput!) {
    videoPauseEventCreate(input: $input) {
      id
    }
  }
`
export const VIDEO_COMPLETE_EVENT_CREATE = gql`
  mutation VideoCompleteEventCreate($input: VideoCompleteEventCreateInput!) {
    videoCompleteEventCreate(input: $input) {
      id
    }
  }
`

export interface VideoEventsProps {
  player: videojs.Player
  startAt: number
  endAt: number
  autoplay: boolean
  blockId: string
}

export function VideoEvents({
  player,
  startAt,
  endAt,
  blockId
}: VideoEventsProps): ReactElement {
  const [videoStartEventCreate] = useMutation<VideoStartEventCreate>(
    VIDEO_START_EVENT_CREATE
  )
  const [videoPlayEventCreate] = useMutation<VideoPlayEventCreate>(
    VIDEO_PLAY_EVENT_CREATE
  )
  const [videoPauseEventCreate] = useMutation<VideoPauseEventCreate>(
    VIDEO_PAUSE_EVENT_CREATE
  )
  const [videoCompleteEventCreate] = useMutation<VideoCompleteEventCreate>(
    VIDEO_COMPLETE_EVENT_CREATE
  )

  useEffect(() => {
    player.on('ready', () => {
      void videoStartEventCreate({
        variables: {
          input: {
            id: uuidv4(),
            blockId,
            position: player.currentTime()
          }
        }
      })
    })

    player.on('playing', () => {
      void videoPlayEventCreate({
        variables: {
          input: {
            id: uuidv4(),
            blockId,
            position: player.currentTime()
          }
        }
      })
    })

    player.on('pause', () => {
      void videoPauseEventCreate({
        variables: {
          input: {
            id: uuidv4(),
            blockId,
            position: player.currentTime()
          }
        }
      })
    })

    player.on('ended', () => {
      void videoCompleteEventCreate({
        variables: {
          input: {
            id: uuidv4(),
            blockId,
            position: player.currentTime()
          }
        }
      })
    })

    player.on('fullscreenchange', () => {
      if (player.isFullscreen()) {
        console.log('FULLSCREEN EXPAND')
      } else if (!player.isFullscreen()) {
        console.log('FULLSCREEN COLLAPSE')
      }
    })
  }, [
    blockId,
    player,
    videoStartEventCreate,
    videoPlayEventCreate,
    videoPauseEventCreate,
    videoCompleteEventCreate
  ])

  return <></>
}
