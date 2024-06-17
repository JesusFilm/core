import fscreen from 'fscreen'
import { useRouter } from 'next/router'
import { usePlausible } from 'next-plausible'
import { ReactElement, useEffect, useState } from 'react'
import Player from 'video.js/dist/types/player'

import { isIPhone } from '@core/shared/ui/deviceUtils'

import { handleAction } from '../../libs/action'
import { useBlocks, type TreeBlock } from '../../libs/block'
import { useJourney } from '../../libs/JourneyProvider'
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
  const { variant } = useJourney()
  const { blockHistory } = useBlocks()
  const [triggered, setTriggered] = useState(false)
  const plausible = usePlausible<JourneyPlausibleEvents>()
  const activeBlock = blockHistory[blockHistory.length - 1]
  const stepId = activeBlock?.id

  useEffect(() => {
    if (player != null && !triggered) {
      const handleTimeUpdate = (): void => {
        if (
          (player.currentTime() ?? 0) >= triggerStart - 0.25 &&
          !(player.scrubbing() ?? false)
        ) {
          setTriggered(true)
          player.pause()

          if (variant === 'embed' && !isIPhone()) {
            handleAction(router, triggerAction)
            const input = { blockId }
            plausible('videoTrigger', {
              props: {
                ...input,
                key: keyify({
                  stepId: input.blockId,
                  event: 'videoTrigger',
                  blockId: input.blockId,
                  target: triggerAction
                })
              }
            })
            return
          }
          if (player.isFullscreen() ?? false) {
            void player.exitFullscreen().then(() => {
              handleAction(router, triggerAction)
              const input = { blockId }
              plausible('videoTrigger', {
                props: {
                  ...input,
                  key: keyify({
                    stepId: input.blockId,
                    event: 'videoTrigger',
                    blockId: input.blockId,
                    target: triggerAction
                  })
                }
              })
            })
          } else {
            if (fscreen.fullscreenElement != null) {
              void fscreen.exitFullscreen()
            }
            handleAction(router, triggerAction)
            const input = { blockId }
            plausible('videoTrigger', {
              props: {
                ...input,
                key: keyify({
                  stepId,
                  event: 'videoTrigger',
                  blockId: input.blockId,
                  target: triggerAction
                })
              }
            })
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
