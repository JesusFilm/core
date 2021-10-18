import videojs from 'video.js'
import { TreeBlock } from "../../../libs/transformer/transformer"
import { ReactElement } from "react"
import { GetJourney_journey_blocks_TriggerBlock as TriggerBlock } from "../../../../__generated__/GetJourney"
import { handleAction } from '../../../libs/action'

export interface TriggerProps extends TreeBlock<TriggerBlock> {
  player?: videojs.Player
}

export function Trigger({ player, triggerAction, triggerStart }: TriggerProps): ReactElement {
  return (
    <>
      {/* currently it only works when it gets paused. have it trigger in a way where it triggers as time passes  */}
      {player !== undefined && (player.currentTime() >= triggerStart && handleAction(triggerAction))}
    </>
  )
}