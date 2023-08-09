import fscreen from 'fscreen'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'
import Player from 'video.js/dist/types/player'

import { handleAction } from '../../libs/action'
import type { TreeBlock } from '../../libs/block'

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
      const handleTimeUpdate = (): void => {
        if (player.currentTime() >= triggerStart - 1 && !player.scrubbing()) {
          setTriggered(true)
          player.pause()

          if (player.isFullscreen()) {
            void player
              .exitFullscreen()
              .then(() => handleAction(router, triggerAction))
          } else {
            if (fscreen.fullscreenElement != null) {
              void fscreen.exitFullscreen()
            }
            handleAction(router, triggerAction)
          }
        }
      }
      player.on('timeupdate', handleTimeUpdate)
      return () => player.off('timeupdate', handleTimeUpdate)
    }
  }, [player, triggerStart, router, triggerAction, triggered])

  return <></>
}
