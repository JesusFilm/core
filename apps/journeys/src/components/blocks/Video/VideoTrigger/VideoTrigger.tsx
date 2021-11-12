import videojs from 'video.js'
import { TreeBlock } from '../../../../libs/transformer/transformer'
import { ReactElement, useCallback, useEffect, useState } from 'react'
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
  const [triggered, setTriggered] = useState(false)

  const handleTriggerAction = useCallback((): void => {
    if (!triggered) {
      setTriggered(true)
      handleAction(router, triggerAction)
    }
  }, [setTriggered, router, triggerAction, triggered])

  useEffect(() => {
    if (player != null) {
      const timeUpdate = (): void => {
        if (player.currentTime() >= triggerStart) {
          player.pause()

          if (player.isFullscreen()) {
            player.exitFullscreen()
            setTimeout(handleTriggerAction, 1000)
          } else {
            handleTriggerAction()
          }
        }
      }
      player.on('timeupdate', timeUpdate)
      return () => player.off('timeupdate', timeUpdate)
    }
  }, [player, triggerStart, handleTriggerAction])

  return <></>
}
