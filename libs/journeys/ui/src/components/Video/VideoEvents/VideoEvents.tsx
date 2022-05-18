import { gql, useMutation } from '@apollo/client'
import { ReactElement, useEffect } from 'react'
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

  const start = startAt ?? 0
  const end = endAt ?? player.duration()
  const position25 = Math.floor((end - start) / 4 + start)
  const position50 = Math.floor((end - start) / 2 + start)
  const position75 = Math.floor(((end - start) * 3) / 4 + start)

  const [videoProgressEventCreate25, { called: called25 }] =
    useMutation<VideoProgressEventCreate>(VIDEO_PROGRESS_EVENT_CREATE, {
      variables: {
        input: {
          blockId,
          position: position25,
          progress: 25
        }
      }
    })
  const [videoProgressEventCreate50, { called: called50 }] =
    useMutation<VideoProgressEventCreate>(VIDEO_PROGRESS_EVENT_CREATE, {
      variables: {
        input: {
          blockId,
          position: position50,
          progress: 50
        }
      }
    })
  const [videoProgressEventCreate75, { called: called75 }] =
    useMutation<VideoProgressEventCreate>(VIDEO_PROGRESS_EVENT_CREATE, {
      variables: {
        input: {
          blockId,
          position: position75,
          progress: 75
        }
      }
    })

  useEffect(() => {
    function readyListener(): void {
      void videoStartEventCreate({
        variables: {
          input: {
            blockId,
            position: Math.floor(player.currentTime())
          }
        }
      })
    }
    player.on('ready', readyListener)
    return () => player.off('ready', readyListener)
  }, [player, videoStartEventCreate, blockId])

  useEffect(() => {
    function playingListener(): void {
      void videoPlayEventCreate({
        variables: {
          input: {
            blockId,
            position: Math.floor(player.currentTime())
          }
        }
      })
    }
    player.on('playing', playingListener)
    return () => player.off('playing', playingListener)
  }, [player, videoPlayEventCreate, blockId])

  useEffect(() => {
    function pauseListener(): void {
      void videoPauseEventCreate({
        variables: {
          input: {
            blockId,
            position: Math.floor(player.currentTime())
          }
        }
      })
    }
    player.on('pause', pauseListener)
    return () => player.off('pause', pauseListener)
  }, [player, videoPauseEventCreate, blockId])

  useEffect(() => {
    function endedListener(): void {
      void videoCompleteEventCreate({
        variables: {
          input: {
            blockId,
            position: Math.floor(player.currentTime())
          }
        }
      })
    }
    player.on('ended', endedListener)
    return () => player.off('ended', endedListener)
  }, [player, videoCompleteEventCreate, blockId])

  useEffect(() => {
    function fullscreenchangeListener(): void {
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
    }
    player.on('fullscreenchange', fullscreenchangeListener)
    return () => player.off('fullscreenchange', fullscreenchangeListener)
  }, [player, videoExpandEventCreate, videoCollapseEventCreate, blockId])

  useEffect(() => {
    function timeupdateListener(): void {
      const currentPosition = player.currentTime()
      if (!called25 && currentPosition >= position25) {
        void videoProgressEventCreate25()
      } else if (!called50 && currentPosition >= position50) {
        void videoProgressEventCreate50()
      } else if (!called75 && currentPosition >= position75) {
        void videoProgressEventCreate75()
      }
    }
    player.on('timeupdate', timeupdateListener)
    return () => player.off('timeupdate', timeupdateListener)
  }, [
    player,
    position25,
    position50,
    position75,
    called25,
    called50,
    called75,
    videoProgressEventCreate25,
    videoProgressEventCreate50,
    videoProgressEventCreate75
  ])

  return <></>
}
