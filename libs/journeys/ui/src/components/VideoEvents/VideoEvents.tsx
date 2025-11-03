import { gql, useMutation } from '@apollo/client'
import { sendGTMEvent } from '@next/third-parties/google'
import { usePlausible } from 'next-plausible'
import { ReactElement, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Player from 'video.js/dist/types/player'

import {
  VideoBlockSource,
  VideoCollapseEventCreateInput,
  VideoCompleteEventCreateInput,
  VideoExpandEventCreateInput,
  VideoPauseEventCreateInput,
  VideoPlayEventCreateInput,
  VideoProgressEventCreateInput,
  VideoStartEventCreateInput
} from '../../../__generated__/globalTypes'
import { useBlocks } from '../../libs/block'
import { useJourney } from '../../libs/JourneyProvider'
import { JourneyPlausibleEvents, keyify } from '../../libs/plausibleHelpers'
import { VideoTriggerFields_triggerAction } from '../VideoTrigger/__generated__/VideoTriggerFields'

import {
  VideoCollapseEventCreate,
  VideoCollapseEventCreateVariables
} from './__generated__/VideoCollapseEventCreate'
import {
  VideoCompleteEventCreate,
  VideoCompleteEventCreateVariables
} from './__generated__/VideoCompleteEventCreate'
import {
  VideoExpandEventCreate,
  VideoExpandEventCreateVariables
} from './__generated__/VideoExpandEventCreate'
import {
  VideoPauseEventCreate,
  VideoPauseEventCreateVariables
} from './__generated__/VideoPauseEventCreate'
import {
  VideoPlayEventCreate,
  VideoPlayEventCreateVariables
} from './__generated__/VideoPlayEventCreate'
import {
  VideoProgressEventCreate,
  VideoProgressEventCreateVariables
} from './__generated__/VideoProgressEventCreate'
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
  action: VideoTriggerFields_triggerAction | null
}

export function VideoEvents({
  player,
  blockId,
  videoTitle,
  source,
  videoId,
  startAt,
  endAt,
  action
}: VideoEventsProps): ReactElement {
  const [videoStartEventCreate, { called: calledStart }] =
    useMutation<VideoStartEventCreate>(VIDEO_START_EVENT_CREATE)
  const [videoPlayEventCreate] = useMutation<
    VideoPlayEventCreate,
    VideoPlayEventCreateVariables
  >(VIDEO_PLAY_EVENT_CREATE)
  const [videoPauseEventCreate] = useMutation<
    VideoPauseEventCreate,
    VideoPauseEventCreateVariables
  >(VIDEO_PAUSE_EVENT_CREATE)
  const [videoExpandEventCreate] = useMutation<
    VideoExpandEventCreate,
    VideoExpandEventCreateVariables
  >(VIDEO_EXPAND_EVENT_CREATE)
  const [videoCollapseEventCreate] = useMutation<
    VideoCollapseEventCreate,
    VideoCollapseEventCreateVariables
  >(VIDEO_COLLAPSE_EVENT_CREATE)

  const plausible = usePlausible<JourneyPlausibleEvents>()
  const { blockHistory } = useBlocks()
  const { journey } = useJourney()
  const activeBlock = blockHistory[blockHistory.length - 1]
  const stepId = activeBlock?.id

  const start = startAt ?? 0
  const end = endAt ?? player.duration() ?? 1
  const position25 = (end - start) / 4 + start
  const position50 = (end - start) / 2 + start
  const position75 = ((end - start) * 3) / 4 + start

  const [videoProgressEventCreate25, { called: called25 }] = useMutation<
    VideoProgressEventCreate,
    VideoProgressEventCreateVariables
  >(VIDEO_PROGRESS_EVENT_CREATE)
  const [videoProgressEventCreate50, { called: called50 }] = useMutation<
    VideoProgressEventCreate,
    VideoProgressEventCreateVariables
  >(VIDEO_PROGRESS_EVENT_CREATE)
  const [videoProgressEventCreate75, { called: called75 }] = useMutation<
    VideoProgressEventCreate,
    VideoProgressEventCreateVariables
  >(VIDEO_PROGRESS_EVENT_CREATE)
  const [videoCompleteEventCreate, { called: calledComplete }] = useMutation<
    VideoCompleteEventCreate,
    VideoCompleteEventCreateVariables
  >(VIDEO_COMPLETE_EVENT_CREATE)

  // PLAY event
  useEffect(() => {
    function playListener(): void {
      const id = uuidv4()
      const currentTime = player.currentTime() ?? 0
      if (currentTime >= start) {
        const input: VideoPlayEventCreateInput = {
          id,
          blockId,
          position: player.currentTime(),
          stepId,
          label: videoTitle,
          value: source
        }
        void videoPlayEventCreate({
          variables: {
            input
          }
        })
        if (journey != null) {
          const key = keyify({
            stepId: input.stepId ?? '',
            event: 'videoPlay',
            blockId: input.blockId
          })
          plausible('videoPlay', {
            u: `${window.location.origin}/${journey.id}/${input.stepId}`,
            props: {
              ...input,
              key,
              simpleKey: key
            }
          })
        }
        sendGTMEvent({
          event: 'video_play',
          eventId: id,
          blockId,
          videoPosition: currentTime,
          videoTitle,
          videoId
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
    source,
    journey,
    plausible
  ])

  // PAUSE event
  useEffect(() => {
    function pauseListener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime()
      const input: VideoPauseEventCreateInput = {
        id,
        blockId,
        position: currentPosition,
        stepId,
        label: videoTitle,
        value: source
      }
      void videoPauseEventCreate({
        variables: {
          input
        }
      })
      if (journey != null) {
        const key = keyify({
          stepId: input.stepId ?? '',
          event: 'videoPause',
          blockId: input.blockId
        })
        plausible('videoPause', {
          u: `${window.location.origin}/${journey.id}/${input.stepId}`,
          props: {
            ...input,
            key,
            simpleKey: key
          }
        })
      }
      sendGTMEvent({
        event: 'video_pause',
        eventId: id,
        blockId,
        videoPosition: currentPosition,
        videoTitle,
        videoId
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
    stepId,
    journey,
    plausible
  ])

  // EXPAND event
  useEffect(() => {
    function expandListener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime()
      if (player.isFullscreen() ?? false) {
        const input: VideoExpandEventCreateInput = {
          id,
          blockId,
          position: currentPosition,
          stepId,
          label: videoTitle,
          value: source
        }
        void videoExpandEventCreate({
          variables: {
            input
          }
        })
        if (journey != null) {
          const key = keyify({
            stepId: input.stepId ?? '',
            event: 'videoExpand',
            blockId: input.blockId
          })
          plausible('videoExpand', {
            u: `${window.location.origin}/${journey.id}/${input.stepId}`,
            props: {
              ...input,
              key,
              simpleKey: key
            }
          })
        }
        sendGTMEvent({
          event: 'video_expand',
          eventId: id,
          blockId,
          videoPosition: currentPosition,
          videoTitle,
          videoId
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
    source,
    journey,
    plausible
  ])

  // COLLAPSE event
  useEffect(() => {
    function collapseListener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime() ?? 0
      if (!(player.isFullscreen() ?? false)) {
        const input: VideoCollapseEventCreateInput = {
          id,
          blockId,
          position: currentPosition,
          stepId,
          label: videoTitle,
          value: source
        }
        void videoCollapseEventCreate({
          variables: {
            input
          }
        })
        if (journey != null) {
          const key = keyify({
            stepId: input.stepId ?? '',
            event: 'videoCollapse',
            blockId: input.blockId
          })
          plausible('videoCollapse', {
            u: `${window.location.origin}/${journey.id}/${input.stepId}`,
            props: {
              ...input,
              key,
              simpleKey: key
            }
          })
        }
        sendGTMEvent({
          event: 'video_collapse',
          eventId: id,
          blockId,
          videoPosition: currentPosition,
          videoTitle,
          videoId
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
    source,
    journey,
    plausible
  ])

  // START event
  useEffect(() => {
    function startListener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime() ?? 0
      if (!calledStart && currentPosition >= start) {
        const input: VideoStartEventCreateInput = {
          id,
          blockId,
          position: currentPosition,
          stepId,
          label: videoTitle,
          value: source
        }
        void videoStartEventCreate({
          variables: {
            input
          }
        })
        if (journey != null) {
          const key = keyify({
            stepId: input.stepId ?? '',
            event: 'videoStart',
            blockId: input.blockId
          })
          plausible('videoStart', {
            u: `${window.location.origin}/${journey.id}/${input.stepId}`,
            props: {
              ...input,
              key,
              simpleKey: key
            }
          })
        }
        sendGTMEvent({
          event: 'video_start',
          eventId: id,
          blockId,
          videoPosition: currentPosition,
          videoTitle,
          videoId
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
    source,
    journey,
    plausible
  ])

  // PROGRESS 25% event
  useEffect(() => {
    function timeupdate25Listener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime() ?? 0
      if (!called25 && currentPosition >= position25) {
        const input: VideoProgressEventCreateInput = {
          id,
          blockId,
          position: position25,
          progress: 25,
          stepId,
          label: videoTitle,
          value: source
        }
        void videoProgressEventCreate25({
          variables: {
            input
          }
        })
        if (journey != null) {
          const key = keyify({
            stepId: input.stepId ?? '',
            event: 'videoProgress25',
            blockId: input.blockId
          })
          plausible('videoProgress25', {
            u: `${window.location.origin}/${journey.id}/${input.stepId}`,
            props: {
              ...input,
              key,
              simpleKey: key
            }
          })
        }
        sendGTMEvent({
          event: 'video_progress',
          eventId: id,
          blockId,
          videoPosition: currentPosition,
          videoProgress: 25,
          videoTitle,
          videoId
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
    source,
    journey,
    plausible
  ])

  // PROGRESS 50% event
  useEffect(() => {
    function timeupdate50Listener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime() ?? 0
      if (!called50 && currentPosition >= position50) {
        const input: VideoProgressEventCreateInput = {
          id,
          blockId,
          position: position50,
          progress: 50,
          stepId,
          label: videoTitle,
          value: source
        }
        void videoProgressEventCreate50({
          variables: {
            input
          }
        })
        if (journey != null) {
          const key = keyify({
            stepId: input.stepId ?? '',
            event: 'videoProgress50',
            blockId: input.blockId
          })
          plausible('videoProgress50', {
            u: `${window.location.origin}/${journey.id}/${input.stepId}`,
            props: {
              ...input,
              key,
              simpleKey: key
            }
          })
        }
        sendGTMEvent({
          event: 'video_progress',
          eventId: id,
          blockId,
          videoPosition: currentPosition,
          videoProgress: 50,
          videoTitle,
          videoId
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
    source,
    journey,
    plausible
  ])

  // PROGRESS 75% event
  useEffect(() => {
    function timeupdate75Listener(): void {
      const id = uuidv4()
      const currentPosition = player.currentTime() ?? 0
      if (!called75 && currentPosition >= position75) {
        const input: VideoProgressEventCreateInput = {
          id,
          blockId,
          position: position75,
          progress: 75,
          stepId,
          label: videoTitle,
          value: source
        }
        void videoProgressEventCreate75({
          variables: {
            input
          }
        })
        if (journey != null) {
          const key = keyify({
            stepId: input.stepId ?? '',
            event: 'videoProgress75',
            blockId: input.blockId
          })
          plausible('videoProgress75', {
            u: `${window.location.origin}/${journey.id}/${input.stepId}`,
            props: {
              ...input,
              key,
              simpleKey: key
            }
          })
        }
        sendGTMEvent({
          event: 'video_progress',
          journeyId: undefined,
          eventId: id,
          blockId,
          videoPosition: currentPosition,
          videoProgress: 75,
          videoTitle,
          videoId
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
    source,
    journey,
    plausible
  ])

  // COMPLETE event
  useEffect(() => {
    function completeListener(): void {
      const id = uuidv4()
      // + 2 to current time to prevent race condition between videoComplete and stepView events
      const currentPosition = (player.currentTime() ?? 0) + 2
      if (!calledComplete && currentPosition >= end) {
        const input: VideoCompleteEventCreateInput = {
          id,
          blockId,
          position: currentPosition,
          stepId,
          label: videoTitle,
          value: source
        }
        void videoCompleteEventCreate({
          variables: {
            input
          }
        })
        if (journey != null)
          plausible('videoComplete', {
            u: `${window.location.origin}/${journey.id}/${input.stepId}`,
            props: {
              ...input,
              key: keyify({
                stepId: input.stepId ?? '',
                event: 'videoComplete',
                blockId: input.blockId,
                target: action
              }),
              simpleKey: keyify({
                stepId: input.stepId ?? '',
                event: 'videoComplete',
                blockId: input.blockId
              })
            }
          })
        sendGTMEvent({
          event: 'video_complete',
          eventId: id,
          blockId,
          videoPosition: currentPosition,
          videoTitle,
          videoId
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
    source,
    journey,
    plausible,
    action
  ])

  return <></>
}
