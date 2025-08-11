import {
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_VideoTriggerBlock as VideoTriggerBlock
} from '../../../../../__generated__/GetJourney'
import { MessagePlatform } from '../../../../../__generated__/globalTypes'

type JourneyLink =
  | {
      id: string
      linkType: 'chatButtons'
      url: string
      label: string
      parentStepId?: never
    }
  | {
      id: string
      linkType: 'block'
      url: string
      label: string
      parentStepId?: string | null
    }

export function getJourneyLinks(journey?: Journey): JourneyLink[] {
  if (journey == null) return []

  const links: JourneyLink[] = []

  // Collect chat buttons as top-level links (no step association)
  const chatButtons = journey.chatButtons ?? []
  chatButtons.forEach((chatButton) => {
    links.push({
      id: chatButton.id,
      linkType: 'chatButtons',
      url: chatButton.link ?? '',
      label:
        chatButton.platform != null ? MessagePlatform[chatButton.platform] : ''
    })
  })

  const blocks = journey?.blocks ?? []
  if (blocks.length === 0) return links
  blocks.forEach((block) => {
    let action:
      | ButtonBlock['action']
      | RadioOptionBlock['action']
      | VideoBlock['action']
      | VideoTriggerBlock['triggerAction']
      | null
      | undefined
    let label: string = ''
    switch (block.__typename) {
      case 'ButtonBlock':
        action = block.action
        label = block.label
        break
      case 'RadioOptionBlock':
        action = block.action
        label = block.label
        break
      case 'VideoBlock':
        action = block.action
        label = block.title ?? ''
        break
      case 'VideoTriggerBlock':
        action = block.triggerAction
        label = ''
        break
      default:
        action = null
    }

    if (action == null) return

    let url: string | null = null
    let parentStepId: string | null = null
    switch (action.__typename) {
      case 'LinkAction':
        if (action.customizable === true) {
          url = action.url
          parentStepId = action.parentStepId ?? null
        }
        break
      case 'EmailAction':
        if (action.customizable === true) {
          url = action.email
          parentStepId = action.parentStepId ?? null
        }
        break
      default:
        url = null
    }
    if (url == null) return

    links.push({
      id: block.id,
      linkType: 'block',
      parentStepId,
      url,
      label
    })
  })

  return links
}
