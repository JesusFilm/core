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
        const currentTime = player.currentTime() ?? 0
        const isScrubbing = player.scrubbing() ?? false
        if (currentTime >= triggerStart - 0.25 && !isScrubbing) {
          setTriggered(true)
          player.pause()

          if (player.isFullscreen() ?? false) {
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
