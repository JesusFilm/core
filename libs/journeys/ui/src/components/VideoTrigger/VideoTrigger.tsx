import fscreen from 'fscreen'
import { useRouter } from 'next/router'
import { usePlausible } from 'next-plausible'
import { ReactElement, useEffect, useRef, useState } from 'react'
import Player from 'video.js/dist/types/player'

import { isIPhone } from '@core/shared/ui/deviceUtils'

import { handleAction } from '../../libs/action'
import { type TreeBlock, useBlocks } from '../../libs/block'
import { getNextStepSlug } from '../../libs/getNextStepSlug'
import { useJourney } from '../../libs/JourneyProvider'
import {
  JourneyPlausibleEvents,
  keyify,
  templateKeyify
} from '../../libs/plausibleHelpers'

import { VideoTriggerFields } from './__generated__/VideoTriggerFields'
import { actionToTarget } from '../../libs/plausibleHelpers/plausibleHelpers'

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
  const triggeredRef = useRef(false)
  const { blockHistory } = useBlocks()
  const activeBlock = blockHistory[blockHistory.length - 1] as
    | TreeBlock
    | undefined
  const plausible = usePlausible<JourneyPlausibleEvents>()

  // Reset triggered state when player changes
  useEffect(() => {
    triggeredRef.current = false
    setTriggered(false)
  }, [player])

  useEffect(() => {
    if (
      player != null &&
      !triggered &&
      !triggeredRef.current &&
      activeBlock?.id != null
    ) {
      const handleTimeUpdate = (): void => {
        if (
          (player.currentTime() ?? 0) >= triggerStart - 0.25 &&
          !(player.scrubbing() ?? false) &&
          !triggeredRef.current
        ) {
          triggeredRef.current = true
          setTriggered(true)
          player.pause()

          const input: {
            props: JourneyPlausibleEvents['VideoTrigger']
            u: string
          } = {
            u: `${window.location.origin}/${journey?.id ?? ''}/${
              activeBlock.id
            }`,
            props: {
              blockId,
              key: keyify({
                stepId: blockId,
                event: 'videoTrigger',
                blockId,
                target: triggerAction,
                journeyId: journey?.id
              }),
              simpleKey: keyify({
                stepId: blockId,
                event: 'videoTrigger',
                blockId,
                journeyId: journey?.id
              }),
              templateKey: templateKeyify({
                event: 'videoTrigger',
                target: actionToTarget(triggerAction),
                journeyId: journey?.id
              }),
              simpleTemplateKey: templateKeyify({
                event: 'videoTrigger'
              })
            }
          }

          const nextStepSlug = getNextStepSlug(journey, triggerAction)
          if (variant === 'embed' && !isIPhone()) {
            handleAction(router, triggerAction, nextStepSlug)
            plausible('videoTrigger', input)
            return
          }
          if (player.isFullscreen() ?? false) {
            void player.exitFullscreen().then(() => {
              handleAction(router, triggerAction, nextStepSlug)
              plausible('videoTrigger', input)
            })
          } else {
            if (fscreen.fullscreenElement != null) {
              void fscreen.exitFullscreen()
            }
            handleAction(router, triggerAction, nextStepSlug)
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
    plausible,
    journey,
    activeBlock?.id
  ])

  return <></>
}
