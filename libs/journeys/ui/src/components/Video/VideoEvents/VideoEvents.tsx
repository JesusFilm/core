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

  const eventCreate = useCallback(
    (progress: number): void => {
      void videoProgressEventCreate({
        variables: {
          input: {
            blockId,
            position: Math.floor(player.currentTime()),
            progress
          }
        }
      })
    },
    [blockId, player, videoProgressEventCreate]
  )

  const firstTrigger = useRef(true)
  const secondTrigger = useRef(false)
  const thirdTrigger = useRef(false)
  const fourthTrigger = useRef(false)
  const start = startAt ?? 0
  const end = endAt ?? player.duration()
  const firstTriggerTime = (end - start) / 4 + start
  const secondTriggerTime = (end - start) / 2 + start
  const thirdTriggerTime = ((end - start) * 3) / 4 + start

  const progressCalc = useCallback(
    (currentTime: number): void => {
      if (firstTrigger.current && currentTime >= firstTriggerTime) {
        firstTrigger.current = false
        secondTrigger.current = true
        void eventCreate(25)
      } else if (secondTrigger.current && currentTime >= secondTriggerTime) {
        secondTrigger.current = false
        thirdTrigger.current = true
        void eventCreate(50)
      } else if (thirdTrigger.current && currentTime >= thirdTriggerTime) {
        thirdTrigger.current = false
        fourthTrigger.current = true
        void eventCreate(75)
      } else if (fourthTrigger.current && currentTime >= end) {
        fourthTrigger.current = false
        void videoCompleteEventCreate({
          variables: {
            input: {
              blockId,
              position: Math.floor(player.currentTime())
            }
          }
        })
      }
    },
    [
      blockId,
      player,
      end,
      firstTriggerTime,
      secondTriggerTime,
      thirdTriggerTime,
      eventCreate,
      videoCompleteEventCreate
    ]
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
      progressCalc(player.currentTime())
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
