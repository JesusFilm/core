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

  const progressEventCreate = useCallback(
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

  const start = startAt ?? 0
  const end = endAt ?? player.duration()
  const triggerOneRef = useRef(true)
  const triggerTwoRef = useRef(false)
  const triggerThreeRef = useRef(false)
  const triggerFourRef = useRef(false)
  const triggerOnePosition = (end - start) / 4 + start
  const triggerTwoPosition = (end - start) / 2 + start
  const triggerThreePosition = ((end - start) * 3) / 4 + start

  const progressEvent = useCallback(
    (currentPosition: number): void => {
      if (triggerOneRef.current && currentPosition >= triggerOnePosition) {
        triggerOneRef.current = false
        triggerTwoRef.current = true
        void progressEventCreate(25)
      } else if (
        triggerTwoRef.current &&
        currentPosition >= triggerTwoPosition
      ) {
        triggerTwoRef.current = false
        triggerThreeRef.current = true
        void progressEventCreate(50)
      } else if (
        triggerThreeRef.current &&
        currentPosition >= triggerThreePosition
      ) {
        triggerThreeRef.current = false
        triggerFourRef.current = true
        void progressEventCreate(75)
      } else if (triggerFourRef.current && currentPosition >= end) {
        triggerFourRef.current = false
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
      triggerOnePosition,
      triggerTwoPosition,
      triggerThreePosition,
      progressEventCreate,
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
      progressEvent(player.currentTime())
    })
  }, [
    blockId,
    player,
    progressEvent,
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
