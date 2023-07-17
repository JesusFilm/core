import Player from 'video.js/dist/types/player'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'
import fscreen from 'fscreen'
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
      const handleTimeUpdate = (): void => {
        if (player.currentTime() >= triggerStart - 1 && !player.scrubbing()) {
          setTriggered(true)
          player.pause()
        }
      }
      player.on('timeupdate', handleTimeUpdate)
      return () => player.off('timeupdate', handleTimeUpdate)
    }
  }, [player, triggerStart, triggered])

  useEffect(() => {
    if (player != null) {
      const handlePause = (): void => {
        if (triggered) {
          if (player.isFullscreen()) {
            void player
              .exitFullscreen()
              .then(() => handleAction(router, triggerAction))
          } else {
            if (fscreen.fullscreenElement != null) void fscreen.exitFullscreen()
            handleAction(router, triggerAction)
          }
        }
      }
      player.on('pause', handlePause)
      return () => player.off('pause', handlePause)
    }
  }, [player, router, triggerAction, triggered])

  return <></>
}
