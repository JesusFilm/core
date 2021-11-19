import videojs from 'video.js'
import { useRouter } from 'next/router'
import { TreeBlock } from '../../..'
import { handleAction } from '../../../libs/action'
import { ReactElement, useEffect, useState } from 'react'
import { VideoTriggerFields } from './__generated__/VideoTriggerFields'

export interface TriggerProps extends TreeBlock<VideoTriggerFields> {
  player?: videojs.Player
}

export function Trigger({
  player,
  triggerAction,
  triggerStart
}: TriggerProps): ReactElement {
  const router = useRouter()
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    if (player != null && !triggered) {
      const timeUpdate = (): void => {
        if (player.currentTime() >= triggerStart && !player.seeking()) {
          setTriggered(true)
          player.pause()
          if (player.isFullscreen()) {
            player.exitFullscreen()
            setTimeout(() => handleAction(router, triggerAction), 1000)
          } else {
            handleAction(router, triggerAction)
          }
        }
      }
      player.on('timeupdate', timeUpdate)
      return () => player.off('timeupdate', timeUpdate)
    }
  }, [player, triggerStart, router, triggerAction, triggered])

  return <></>
}
