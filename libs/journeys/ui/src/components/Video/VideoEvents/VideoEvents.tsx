import { gql, useMutation } from '@apollo/client'
import { ReactElement, useEffect, useCallback, useRef } from 'react'
import videojs from 'video.js'
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
  blockId: string
  startAt: number
  endAt: number
}

export function VideoEvents({
  player,
  blockId,
  startAt,
  endAt
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

  const firstTrigger = useRef(false)
  const secondTrigger = useRef(false)
  const thirdTrigger = useRef(false)

  const calc = useCallback(
    (currentTime: number): string | undefined => {
      const firstTriggerTime = (endAt - startAt) / 4 + startAt
      const secondTriggerTime = (endAt - startAt) / 2 + startAt
      const thirdTriggerTime = ((endAt - startAt) * 3) / 4 + startAt

      let result

      if (!firstTrigger.current && currentTime > firstTriggerTime) {
        result = 'PROGRESS 25%'
        firstTrigger.current = true
      } else if (!secondTrigger.current && currentTime > secondTriggerTime) {
        result = 'PROGRESS 50%'
        secondTrigger.current = true
      } else if (!thirdTrigger.current && currentTime > thirdTriggerTime) {
        result = 'PROGRESS 75%'
        thirdTrigger.current = true
      } else {
        result = 'error'
      }

      return result !== 'error' ? result : undefined
    },
    [startAt, endAt]
  )

  useEffect(() => {
    player.on('ready', () => {
      void videoStartEventCreate({
        variables: {
          input: {
            blockId,
            position: Math.floor(Math.floor(player.currentTime()))
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

    player.on('timeupdate', () => {
      console.log(player.currentTime() != null && calc(player.currentTime()))
    })
  }, [
    blockId,
    player,
    calc,
    videoStartEventCreate,
    videoPlayEventCreate,
    videoPauseEventCreate,
    videoCompleteEventCreate
  ])

  return <></>
}
