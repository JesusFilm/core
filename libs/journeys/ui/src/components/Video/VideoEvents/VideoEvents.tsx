import { ReactElement, useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'
import videojs from 'video.js'
import { VideoStartEventCreate } from './__generated__/VideoStartEventCreate'
import { VideoPlayEventCreate } from './__generated__/VideoPlayEventCreate'
import { VideoPauseEventCreate } from './__generated__/VideoPauseEventCreate'
import { VideoCompleteEventCreate } from './__generated__/VideoCompleteEventCreate'

// ADD COMMENT, REMOVE LATER

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
  blockId: string
}

export function VideoEvents({
  player,
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
            blockId,
            position: Math.floor(player.currentTime())
          }
        }
      })
    })

    player.on('playing', () => {
      void videoPlayEventCreate({
        variables: {
          input: {
            blockId,
            position: Math.floor(player.currentTime())
          }
        }
      })
    })

    player.on('pause', () => {
      void videoPauseEventCreate({
        variables: {
          input: {
            blockId,
            position: Math.floor(player.currentTime())
          }
        }
      })
    })

    player.on('ended', () => {
      void videoCompleteEventCreate({
        variables: {
          input: {
            blockId,
            position: Math.floor(player.currentTime())
          }
        }
      })
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
