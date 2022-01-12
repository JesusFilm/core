import videojs from 'video.js'
import { ReactElement, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { TreeBlock } from '../../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_VideoTriggerBlock as TriggerBlock } from '../../../../../__generated__/GetJourney'
import { handleAction } from '../../../../libs/action'

export interface TriggerProps extends TreeBlock<TriggerBlock> {
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
