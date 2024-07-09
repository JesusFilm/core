import fscreen from 'fscreen'
import { usePlausible } from 'next-plausible'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'
import Player from 'video.js/dist/types/player'

import { isIPhone } from '@core/shared/ui/deviceUtils'

import { useJourney } from '../../libs/JourneyProvider'
import { handleAction } from '../../libs/action'
import { type TreeBlock, useBlocks } from '../../libs/block'
import { JourneyPlausibleEvents, keyify } from '../../libs/plausibleHelpers'

import { VideoTriggerFields } from './__generated__/VideoTriggerFields'

type VideoTriggerProps = (
  | TreeBlock<VideoTriggerFields>
  | Pick<TreeBlock<VideoTriggerFields>, 'triggerAction' | 'triggerStart'>
) & {
  blockId: string
  player?: Player
}

export function VideoTrigger({
  blockId,
  player,
  triggerAction,
  triggerStart
}: VideoTriggerProps): ReactElement {
  const router = useRouter()
  const { journey, variant } = useJourney()
  const [triggered, setTriggered] = useState(false)
  const { blockHistory } = useBlocks()
  const activeBlock = blockHistory[blockHistory.length - 1]
  const plausible = usePlausible<JourneyPlausibleEvents>()

  useEffect(() => {
    if (player != null && !triggered) {
      const handleTimeUpdate = (): void => {
        if (
          (player.currentTime() ?? 0) >= triggerStart - 0.25 &&
          !(player.scrubbing() ?? false)
        ) {
          setTriggered(true)
          player.pause()

          const input = {
            u: `${window.location.origin}/${journey?.id ?? ''}/${activeBlock.id}`,
            props: {
              blockId,
              key: keyify({
                stepId: blockId,
                event: 'videoTrigger',
                blockId: blockId,
                target: triggerAction
              }),
              simpleKey: keyify({
                stepId: blockId,
                event: 'videoTrigger',
                blockId: blockId
              })
            }
          }

          if (variant === 'embed' && !isIPhone()) {
            handleAction(router, triggerAction)
            plausible('videoTrigger', input)
            return
          }
          if (player.isFullscreen() ?? false) {
            void player.exitFullscreen().then(() => {
              handleAction(router, triggerAction)
              plausible('videoTrigger', input)
            })
          } else {
            if (fscreen.fullscreenElement != null) {
              void fscreen.exitFullscreen()
            }
            handleAction(router, triggerAction)
            plausible('videoTrigger', input)
          }
        }
      }
      player.on('timeupdate', handleTimeUpdate)
      return () => player.off('timeupdate', handleTimeUpdate)
    }
  }, [
    player,
    triggerStart,
    router,
    triggerAction,
    triggered,
    variant,
    blockId,
    plausible
  ])

  return <></>
}
