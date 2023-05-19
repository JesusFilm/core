import videojs from 'video.js'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'
import type { TreeBlock } from '../../libs/block'
import { handleAction } from '../../libs/action'
import { VideoTriggerFields } from './__generated__/VideoTriggerFields'

type VideoTriggerProps = (
  | TreeBlock<VideoTriggerFields>
  | Pick<TreeBlock<VideoTriggerFields>, 'triggerAction' | 'triggerStart'>
) & {
  player?: videojs.Player
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
        if (player.currentTime() >= triggerStart - 1 && !player.seeking()) {
          setTriggered(true)
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
