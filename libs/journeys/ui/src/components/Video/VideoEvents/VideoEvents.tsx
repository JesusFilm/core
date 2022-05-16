import { ReactElement, useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'
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

interface VideoEventsProps {
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
    const videoPosition = player.currentTime()
    const position = videoPosition != null ? Math.floor(videoPosition) : 0

    player.on('ready', () => {
      const id = uuidv4()
      void videoStartEventCreate({
        variables: {
          input: {
            id,
            blockId,
            position
          }
        }
      })
    })

    player.on('playing', () => {
      const id = uuidv4()
      void videoPlayEventCreate({
        variables: {
          input: {
            id,
            blockId,
            position
          }
        }
      })
    })

    player.on('pause', () => {
      const id = uuidv4()
      void videoPauseEventCreate({
        variables: {
          input: {
            id,
            blockId,
            position
          }
        }
      })
    })

    player.on('ended', () => {
      const id = uuidv4()
      void videoCompleteEventCreate({
        variables: {
          input: {
            id,
            blockId,
            position
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
