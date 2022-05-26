import { gql, useMutation } from '@apollo/client'
import { ReactElement, useEffect } from 'react'
import videojs from 'video.js'
import TagManager from 'react-gtm-module'
import { v4 as uuidv4 } from 'uuid'
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
  const [videoStartEventCreate, { called: calledStart }] =
    useMutation<VideoStartEventCreate>(VIDEO_START_EVENT_CREATE)
  const [videoPlayEventCreate] = useMutation<VideoPlayEventCreate>(
    VIDEO_PLAY_EVENT_CREATE
  )
  const [videoPauseEventCreate] = useMutation<VideoPauseEventCreate>(
    VIDEO_PAUSE_EVENT_CREATE
  )
  const [videoExpandEventCreate] = useMutation<VideoExpandEventCreate>(
    VIDEO_EXPAND_EVENT_CREATE
  )
  const [videoCollapseEventCreate] = useMutation<VideoCollapseEventCreate>(
    VIDEO_COLLAPSE_EVENT_CREATE
  )

  const start = startAt ?? 0
  const end = endAt ?? player.duration()
  const position25 = (end - start) / 4 + start
  const position50 = (end - start) / 2 + start
  const position75 = ((end - start) * 3) / 4 + start

  const [videoProgressEventCreate25, { called: called25 }] =
    useMutation<VideoProgressEventCreate>(VIDEO_PROGRESS_EVENT_CREATE)
  const [videoProgressEventCreate50, { called: called50 }] =
    useMutation<VideoProgressEventCreate>(VIDEO_PROGRESS_EVENT_CREATE)
  const [videoProgressEventCreate75, { called: called75 }] =
    useMutation<VideoProgressEventCreate>(VIDEO_PROGRESS_EVENT_CREATE)
  const [videoCompleteEventCreate, { called: calledComplete }] =
    useMutation<VideoCompleteEventCreate>(VIDEO_COMPLETE_EVENT_CREATE)

  // PLAY event
  useEffect(() => {
    function playListener(): void {
      const id = uuidv4()
      const currentTime = player.currentTime()
      if (currentTime >= start) {
        void videoPlayEventCreate({
          variables: {
            input: {
              id,
              blockId,
              position: player.currentTime()
            }
          }
        })
        TagManager.dataLayer({
          dataLayer: {
            event: 'video_play',
            eventId: id,
            blockId,
            videoPosition: currentTime
          }
        })
      }
    }
    player.on('play', playListener)
    return () => player.off('play', playListener)
  }, [player, videoPlayEventCreate, blockId, start])

  // PAUSE event
  useEffect(() => {
    function pauseListener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime()
      void videoPauseEventCreate({
        variables: {
          input: {
            id,
            blockId,
            position: currentPosition
          }
        }
      })
      TagManager.dataLayer({
        dataLayer: {
          event: 'video_pause',
          eventId: id,
          blockId,
          videoPosition: currentPosition
        }
      })
    }
    player.on('pause', pauseListener)
    return () => player.off('pause', pauseListener)
  }, [player, videoPauseEventCreate, blockId])

  // EXPAND event
  useEffect(() => {
    function expandListener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime()
      if (player.isFullscreen()) {
        void videoExpandEventCreate({
          variables: {
            input: {
              id,
              blockId,
              position: currentPosition
            }
          }
        })
        TagManager.dataLayer({
          dataLayer: {
            event: 'video_expand',
            eventId: id,
            blockId,
            videoPosition: currentPosition
          }
        })
      }
    }
    player.on('fullscreenchange', expandListener)
    return () => player.off('fullscreenchange', expandListener)
  }, [player, videoExpandEventCreate, blockId])

  // COLLAPSE event
  useEffect(() => {
    function collapseListener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime()
      if (!player.isFullscreen()) {
        void videoCollapseEventCreate({
          variables: {
            input: {
              id,
              blockId,
              position: currentPosition
            }
          }
        })
        TagManager.dataLayer({
          dataLayer: {
            event: 'video_collapse',
            eventId: id,
            blockId,
            videoPosition: currentPosition
          }
        })
      }
    }
    player.on('fullscreenchange', collapseListener)
    return () => player.off('fullscreenchange', collapseListener)
  }, [player, videoCollapseEventCreate, blockId])

  // START event
  useEffect(() => {
    function startListener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime()
      if (!calledStart && currentPosition >= start) {
        void videoStartEventCreate({
          variables: {
            input: {
              id,
              blockId,
              position: currentPosition
            }
          }
        })
        TagManager.dataLayer({
          dataLayer: {
            event: 'video_start',
            eventId: id,
            blockId,
            videoPosition: currentPosition
          }
        })
      }
    }
    player.on('timeupdate', startListener)
    return () => player.off('timeupdate', startListener)
  }, [player, blockId, calledStart, videoStartEventCreate, start])

  // PROGRESS 25% event
  useEffect(() => {
    function timeupdate25Listener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime()
      if (!called25 && currentPosition >= position25) {
        void videoProgressEventCreate25({
          variables: {
            input: {
              id,
              blockId,
              position: position25,
              progress: 25
            }
          }
        })
        TagManager.dataLayer({
          dataLayer: {
            event: 'video_progress',
            eventId: id,
            blockId,
            videoPosition: currentPosition,
            videoProgress: 25
          }
        })
      }
    }
    player.on('timeupdate', timeupdate25Listener)
    return () => player.off('timeupdate', timeupdate25Listener)
  }, [blockId, player, position25, called25, videoProgressEventCreate25])

  // PROGRESS 50% event
  useEffect(() => {
    function timeupdate50Listener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime()
      if (!called50 && currentPosition >= position50) {
        void videoProgressEventCreate50({
          variables: {
            input: {
              id,
              blockId,
              position: position50,
              progress: 50
            }
          }
        })
        TagManager.dataLayer({
          dataLayer: {
            event: 'video_progress',
            eventId: id,
            blockId,
            videoPosition: currentPosition,
            videoProgress: 50
          }
        })
      }
    }
    player.on('timeupdate', timeupdate50Listener)
    return () => player.off('timeupdate', timeupdate50Listener)
  }, [blockId, player, position50, called50, videoProgressEventCreate50])

  // PROGRESS 75% event
  useEffect(() => {
    function timeupdate75Listener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime()
      if (!called75 && currentPosition >= position75) {
        void videoProgressEventCreate75({
          variables: {
            input: {
              id,
              blockId,
              position: position75,
              progress: 75
            }
          }
        })
        TagManager.dataLayer({
          dataLayer: {
            event: 'video_progress',
            journeyId: undefined,
            eventId: id,
            blockId,
            videoPosition: currentPosition,
            videoProgress: 75
          }
        })
      }
    }
    player.on('timeupdate', timeupdate75Listener)
    return () => player.off('timeupdate', timeupdate75Listener)
  }, [blockId, player, position75, called75, videoProgressEventCreate75])

  // COMPLETE event
  useEffect(() => {
    function completeListener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime()
      if (!calledComplete && currentPosition >= end) {
        void videoCompleteEventCreate({
          variables: {
            input: {
              id,
              blockId,
              position: currentPosition
            }
          }
        })
        TagManager.dataLayer({
          dataLayer: {
            event: 'video_complete',
            eventId: id,
            blockId,
            videoPosition: currentPosition
          }
        })
      }
    }
    player.on('timeupdate', completeListener)
    return () => player.off('timeupdate', completeListener)
  }, [player, end, calledComplete, videoCompleteEventCreate, blockId])

  return <></>
}
