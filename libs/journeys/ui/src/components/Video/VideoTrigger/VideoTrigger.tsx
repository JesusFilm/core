import videojs from 'video.js'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'
import { handleAction } from '../../..'
import { BlockFields_VideoBlock_endAction as Action } from '../../../libs/transformer/__generated__/BlockFields'
import { VideoTriggerFields } from './__generated__/VideoTriggerFields'

export interface VideoTriggerProps {
  videoTrigger?: VideoTriggerFields
  triggerAction?: Action
  triggerStart?: number
  player?: videojs.Player
}

export function VideoTrigger({
  player,
  triggerAction,
  triggerStart,
  videoTrigger
}: VideoTriggerProps): ReactElement {
  const router = useRouter()
  const [triggerAt, setTriggerAt] = useState<number | undefined>(triggerStart)
  const [videoAction, setVideoAction] = useState<Action | undefined>(
    triggerAction
  )
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    if (triggerAction == null) setVideoAction(videoTrigger?.triggerAction)
    if (triggerStart == null) setTriggerAt(videoTrigger?.triggerStart)

    if (
      player != null &&
      !triggered &&
      videoAction != null &&
      triggerAt != null
    ) {
      const timeUpdate = (): void => {
        if (player.currentTime() >= triggerAt && !player.seeking()) {
          setTriggered(true)
          player.pause()
          if (player.isFullscreen()) {
            player.exitFullscreen()
            setTimeout(() => handleAction(router, videoAction), 1000)
          } else {
            handleAction(router, videoAction)
          }
        }
      }
      player.on('timeupdate', timeUpdate)
      return () => player.off('timeupdate', timeUpdate)
    }
  }, [
    player,
    router,
    triggered,
    triggerAction,
    triggerAt,
    triggerStart,
    videoAction,
    videoTrigger
  ])

  return <></>
}
