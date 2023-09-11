import { gql, useMutation } from '@apollo/client'
import { ReactElement, useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { v4 as uuidv4 } from 'uuid'
import Player from 'video.js/dist/types/player'

import { VideoBlockSource } from '../../../__generated__/globalTypes'
import { useBlocks } from '../../libs/block'

import { VideoCollapseEventCreate } from './__generated__/VideoCollapseEventCreate'
import { VideoCompleteEventCreate } from './__generated__/VideoCompleteEventCreate'
import { VideoExpandEventCreate } from './__generated__/VideoExpandEventCreate'
import { VideoPauseEventCreate } from './__generated__/VideoPauseEventCreate'
import { VideoPlayEventCreate } from './__generated__/VideoPlayEventCreate'
import { VideoProgressEventCreate } from './__generated__/VideoProgressEventCreate'
import { VideoStartEventCreate } from './__generated__/VideoStartEventCreate'

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
    }
  }
`

export interface VideoEventsProps {
  player: Player
  blockId: string
  videoTitle: string
  source: VideoBlockSource
  videoId: string
  startAt: number | null
  endAt: number | null
}

export function VideoEvents({
  player,
  blockId,
  videoTitle,
  source,
  videoId,
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

  const { blockHistory } = useBlocks()
  const activeBlock = blockHistory[blockHistory.length - 1]
  const stepId = activeBlock?.id

  const start = startAt ?? 0
  const end = endAt ?? player.duration() ?? 1
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
      const currentTime = player.currentTime() ?? 0
      if (currentTime >= start) {
        void videoPlayEventCreate({
          variables: {
            input: {
              id,
              blockId,
              position: player.currentTime(),
              stepId,
              label: videoTitle,
              value: source
            }
          }
        })
        TagManager.dataLayer({
          dataLayer: {
            event: 'video_play',
            eventId: id,
            blockId,
            videoPosition: currentTime,
            videoTitle,
            videoId
          }
        })
      }
    }
    player.on('play', playListener)
    return () => player.off('play', playListener)
  }, [
    player,
    videoPlayEventCreate,
    blockId,
    start,
    videoTitle,
    videoId,
    stepId,
    source
  ])

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
            position: currentPosition,
            stepId,
            label: videoTitle,
            value: source
          }
        }
      })
      TagManager.dataLayer({
        dataLayer: {
          event: 'video_pause',
          eventId: id,
          blockId,
          videoPosition: currentPosition,
          videoTitle,
          videoId
        }
      })
    }

    player.on('pause', pauseListener)
    return () => player.off('pause', pauseListener)
  }, [
    player,
    videoPauseEventCreate,
    blockId,
    videoTitle,
    videoId,
    source,
    stepId
  ])

  // EXPAND event
  useEffect(() => {
    function expandListener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime()
      const isFullscreen = player.isFullscreen() ?? false
      if (isFullscreen) {
        void videoExpandEventCreate({
          variables: {
            input: {
              id,
              blockId,
              position: currentPosition,
              stepId,
              label: videoTitle,
              value: source
            }
          }
        })
        TagManager.dataLayer({
          dataLayer: {
            event: 'video_expand',
            eventId: id,
            blockId,
            videoPosition: currentPosition,
            videoTitle,
            videoId
          }
        })
      }
    }
    player.on('fullscreenchange', expandListener)
    return () => player.off('fullscreenchange', expandListener)
  }, [
    player,
    videoExpandEventCreate,
    blockId,
    videoTitle,
    videoId,
    stepId,
    source
  ])

  // COLLAPSE event
  useEffect(() => {
    function collapseListener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime()
      const isFullscreen = player.isFullscreen() ?? false
      if (!isFullscreen) {
        void videoCollapseEventCreate({
          variables: {
            input: {
              id,
              blockId,
              position: currentPosition,
              stepId,
              label: videoTitle,
              value: source
            }
          }
        })
        TagManager.dataLayer({
          dataLayer: {
            event: 'video_collapse',
            eventId: id,
            blockId,
            videoPosition: currentPosition,
            videoTitle,
            videoId
          }
        })
      }
    }
    player.on('fullscreenchange', collapseListener)
    return () => player.off('fullscreenchange', collapseListener)
  }, [
    player,
    videoCollapseEventCreate,
    blockId,
    videoTitle,
    videoId,
    stepId,
    source
  ])

  // START event
  useEffect(() => {
    function startListener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime() ?? 0
      if (!calledStart && currentPosition >= start) {
        void videoStartEventCreate({
          variables: {
            input: {
              id,
              blockId,
              position: currentPosition,
              stepId,
              label: videoTitle,
              value: source
            }
          }
        })
        TagManager.dataLayer({
          dataLayer: {
            event: 'video_start',
            eventId: id,
            blockId,
            videoPosition: currentPosition,
            videoTitle,
            videoId
          }
        })
      }
    }
    player.on('timeupdate', startListener)
    return () => player.off('timeupdate', startListener)
  }, [
    player,
    blockId,
    calledStart,
    videoStartEventCreate,
    start,
    videoTitle,
    videoId,
    stepId,
    source
  ])

  // PROGRESS 25% event
  useEffect(() => {
    function timeupdate25Listener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime() ?? 0
      if (!called25 && currentPosition >= position25) {
        void videoProgressEventCreate25({
          variables: {
            input: {
              id,
              blockId,
              position: position25,
              progress: 25,
              stepId,
              label: videoTitle,
              value: source
            }
          }
        })
        TagManager.dataLayer({
          dataLayer: {
            event: 'video_progress',
            eventId: id,
            blockId,
            videoPosition: currentPosition,
            videoProgress: 25,
            videoTitle,
            videoId
          }
        })
      }
    }
    player.on('timeupdate', timeupdate25Listener)
    return () => player.off('timeupdate', timeupdate25Listener)
  }, [
    blockId,
    player,
    position25,
    called25,
    videoProgressEventCreate25,
    videoTitle,
    videoId,
    stepId,
    source
  ])

  // PROGRESS 50% event
  useEffect(() => {
    function timeupdate50Listener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime() ?? 0
      if (!called50 && currentPosition >= position50) {
        void videoProgressEventCreate50({
          variables: {
            input: {
              id,
              blockId,
              position: position50,
              progress: 50,
              stepId,
              label: videoTitle,
              value: source
            }
          }
        })
        TagManager.dataLayer({
          dataLayer: {
            event: 'video_progress',
            eventId: id,
            blockId,
            videoPosition: currentPosition,
            videoProgress: 50,
            videoTitle,
            videoId
          }
        })
      }
    }
    player.on('timeupdate', timeupdate50Listener)
    return () => player.off('timeupdate', timeupdate50Listener)
  }, [
    blockId,
    player,
    position50,
    called50,
    videoProgressEventCreate50,
    videoTitle,
    videoId,
    stepId,
    source
  ])

  // PROGRESS 75% event
  useEffect(() => {
    function timeupdate75Listener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime() ?? 0
      if (!called75 && currentPosition >= position75) {
        void videoProgressEventCreate75({
          variables: {
            input: {
              id,
              blockId,
              position: position75,
              progress: 75,
              stepId,
              label: videoTitle,
              value: source
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
            videoProgress: 75,
            videoTitle,
            videoId
          }
        })
      }
    }
    player.on('timeupdate', timeupdate75Listener)
    return () => player.off('timeupdate', timeupdate75Listener)
  }, [
    blockId,
    player,
    position75,
    called75,
    videoProgressEventCreate75,
    videoTitle,
    videoId,
    stepId,
    source
  ])

  // COMPLETE event
  useEffect(() => {
    function completeListener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime() ?? 0
      if (!calledComplete && currentPosition >= end) {
        void videoCompleteEventCreate({
          variables: {
            input: {
              id,
              blockId,
              position: currentPosition,
              stepId,
              label: videoTitle,
              value: source
            }
          }
        })
        TagManager.dataLayer({
          dataLayer: {
            event: 'video_complete',
            eventId: id,
            blockId,
            videoPosition: currentPosition,
            videoTitle,
            videoId
          }
        })
      }
    }
    player.on('timeupdate', completeListener)
    return () => player.off('timeupdate', completeListener)
  }, [
    player,
    end,
    calledComplete,
    videoCompleteEventCreate,
    blockId,
    videoTitle,
    videoId,
    stepId,
    source
  ])

  return <></>
}
