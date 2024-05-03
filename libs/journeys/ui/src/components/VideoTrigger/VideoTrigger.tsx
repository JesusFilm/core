import fscreen from 'fscreen'
import { useRouter } from 'next/router'
import { usePlausible } from 'next-plausible'
import { ReactElement, useEffect, useState } from 'react'
import Player from 'video.js/dist/types/player'

import { handleAction } from '../../libs/action'
import type { TreeBlock } from '../../libs/block'
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

function iPhone(): boolean {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.userAgent === 'undefined'
  )
    return false

  const userAgent = navigator.userAgent
  return userAgent.includes('iPhone')
}

export function VideoTrigger({
  blockId,
  player,
  triggerAction,
  triggerStart
}: VideoTriggerProps): ReactElement {
  const router = useRouter()
  const { variant } = useJourney()
  const [triggered, setTriggered] = useState(false)
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

          if (variant === 'embed' && !iPhone()) {
            handleAction(router, triggerAction)
            const input = { blockId }
            plausible('videoTrigger', {
              props: {
                ...input,
                key: keyify('videoTrigger', input, triggerAction)
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
                  key: keyify('videoTrigger', input, triggerAction)
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
                key: keyify('videoTrigger', input, triggerAction)
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
