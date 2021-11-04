import videojs from 'video.js'
import { TreeBlock } from '../../../../libs/transformer/transformer'
import { ReactElement, useEffect } from 'react'
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
  useEffect(() => {
    if (player != null) {
      player.on('timeupdate', () => {
        if (player.currentTime() >= triggerStart) {
          if (player.isFullscreen()) player.exitFullscreen()
          player.pause()
          handleAction(triggerAction)
        }
      })
    }
  }, [player, triggerAction, triggerStart])

  return <></>
}
