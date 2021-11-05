import videojs from 'video.js'
import { TreeBlock } from '../../../../libs/transformer/transformer'
import { ReactElement, useEffect } from 'react'
import { GetJourney_journey_blocks_VideoTriggerBlock as TriggerBlock } from '../../../../../__generated__/GetJourney'
import { handleAction } from '../../../../libs/action'
import { useRouter } from 'next/router'

export interface TriggerProps extends TreeBlock<TriggerBlock> {
  player?: videojs.Player
}

export function Trigger({
  player,
  triggerAction,
  triggerStart
}: TriggerProps): ReactElement {
  const router = useRouter()

  useEffect(() => {
    if (player != null) {
      player.on('timeupdate', () => {
        if (player.currentTime() >= triggerStart) {
          player.pause()

          if (player.isFullscreen()) {
            player.exitFullscreen()
            setTimeout(() => {
              handleAction(router, triggerAction)
            }, 1000)
          } else {
            handleAction(router, triggerAction)
          }
        }
      })
    }
  }, [player, triggerAction, triggerStart, router])

  return <></>
}
