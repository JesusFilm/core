import videojs from 'video.js'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { ReactElement } from 'react'
import { GetJourney_journey_blocks_TriggerBlock as TriggerBlock } from '../../../../__generated__/GetJourney'
import { handleAction } from '../../../libs/action'

export interface TriggerProps extends TreeBlock<TriggerBlock> {
  player?: videojs.Player
}

// Is this supposed to be a ReactElement or just a function
// just getting this confused as its a triggerBlock
export function Trigger({
  player,
  triggerAction,
  triggerStart
}: TriggerProps): ReactElement {
  const handleTrigger = (player: videojs.Player): void => {
    player.on('timeupdate', () => {
      if (player.currentTime() >= triggerStart) {
        player.pause()
        handleAction(triggerAction)
      }
    })
  }

  return <>{player !== undefined && handleTrigger(player)}</>
}
