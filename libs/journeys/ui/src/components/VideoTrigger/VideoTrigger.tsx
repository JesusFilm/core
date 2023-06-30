import Player from 'video.js/dist/types/player'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'
import type { TreeBlock } from '../../libs/block'
import { handleAction } from '../../libs/action'
import { VideoTriggerFields } from './__generated__/VideoTriggerFields'

type VideoTriggerProps = (
  | TreeBlock<VideoTriggerFields>
  | Pick<TreeBlock<VideoTriggerFields>, 'triggerAction' | 'triggerStart'>
) & {
  player?: Player
}

export function VideoTrigger({
  player,
  triggerAction,
  triggerStart
}: VideoTriggerProps): ReactElement {
  const router = useRouter()
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    if (player != null && !triggered) {
      const timeUpdate = (): void => {
        if (player.currentTime() >= triggerStart - 1 && !player.scrubbing()) {
          setTriggered(true)
          player.pause()
          if (player.isFullscreen()) {
            void player
              .exitFullscreen()
              .then(() => handleAction(router, triggerAction))
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
