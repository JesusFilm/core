import { gql, useMutation } from '@apollo/client'
import { ReactElement, useEffect, useCallback, useRef } from 'react'
import videojs from 'video.js'
import { VideoStartEventCreate } from './__generated__/VideoStartEventCreate'
import { VideoPlayEventCreate } from './__generated__/VideoPlayEventCreate'
import { VideoPauseEventCreate } from './__generated__/VideoPauseEventCreate'
import { VideoCompleteEventCreate } from './__generated__/VideoCompleteEventCreate'
import { VideoExpandEventCreate } from './__generated__/VideoExpandEventCreate'
import { VideoCollapseEventCreate } from './__generated__/VideoCollapseEventCreate'
import { VideoProgressEventCreate } from './__generated__/VideoProgressEventCreate'

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

export const VIDEO_EXPAND_EVENT_CREATE = gql`
  mutation VideoExpandEventCreate($input: VideoExpandEventCreateInput!) {
    videoExpandEventCreate(input: $input) {
      id
    }
  }
`
export const VIDEO_COLLAPSE_EVENT_CREATE = gql`
  mutation VideoCollapseEventCreate($input: VideoCollapseEventCreateInput!) {
    videoCollapseEventCreate(input: $input) {
      id
    }
  }
`
export const VIDEO_PROGRESS_EVENT_CREATE = gql`
  mutation VideoProgressEventCreate($input: VideoProgressEventCreateInput!) {
    videoProgressEventCreate(input: $input) {
      id
      progress
    }
  }
`

export interface VideoEventsProps {
  player: videojs.Player
  blockId: string
  startAt: number | null
  endAt: number | null
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
  const [videoExpandEventCreate] = useMutation<VideoExpandEventCreate>(
    VIDEO_EXPAND_EVENT_CREATE
  )
  const [videoCollapseEventCreate] = useMutation<VideoCollapseEventCreate>(
    VIDEO_COLLAPSE_EVENT_CREATE
  )
  const [videoProgressEventCreate] = useMutation<VideoProgressEventCreate>(
    VIDEO_PROGRESS_EVENT_CREATE
  )

  const firstTrigger = useRef(false)
  const secondTrigger = useRef(false)
  const thirdTrigger = useRef(false)
  const start = startAt ?? 0
  const end = endAt ?? 0
  const firstTriggerTime = (end - start) / 4 + start
  const secondTriggerTime = (end - start) / 2 + start
  const thirdTriggerTime = ((end - start) * 3) / 4 + start

  const progressCalc = useCallback(
    (currentTime: number): number | null => {
      let result

      if (!firstTrigger.current && currentTime > firstTriggerTime) {
        result = 25
        firstTrigger.current = true
      } else if (!secondTrigger.current && currentTime > secondTriggerTime) {
        result = 50
        secondTrigger.current = true
      } else if (!thirdTrigger.current && currentTime > thirdTriggerTime) {
        result = 75
        thirdTrigger.current = true
      } else {
        result = null
      }
      return result
    },
    [firstTriggerTime, secondTriggerTime, thirdTriggerTime]
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

    player.on('fullscreenchange', () => {
      if (player.isFullscreen()) {
        void videoExpandEventCreate({
          variables: {
            input: {
              blockId,
              position: Math.floor(player.currentTime())
            }
          }
        })
      } else if (!player.isFullscreen()) {
        void videoCollapseEventCreate({
          variables: {
            input: {
              blockId,
              position: Math.floor(player.currentTime())
            }
          }
        })
      }
    })

    player.on('timeupdate', () => {
      const progress =
        player.currentTime() != null && progressCalc(player.currentTime())

      if (progress != null) {
        void videoProgressEventCreate({
          variables: {
            input: {
              blockId,
              position: Math.floor(player.currentTime()),
              progress
            }
          }
        })
      }
    })
  }, [
    blockId,
    player,
    progressCalc,
    videoStartEventCreate,
    videoPlayEventCreate,
    videoPauseEventCreate,
    videoCompleteEventCreate,
    videoExpandEventCreate,
    videoCollapseEventCreate,
    videoProgressEventCreate
  ])

  return <></>
}
