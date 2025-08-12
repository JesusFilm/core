import { TFunction } from 'i18next'

import { resolveJourneyCustomizationString } from '@core/journeys/ui/resolveJourneyCustomizationString'

import {
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_VideoTriggerBlock as VideoTriggerBlock
} from '../../../../../__generated__/GetJourney'
import { MessagePlatform } from '../../../../../__generated__/globalTypes'

export type JourneyLink =
  | {
      id: string
      linkType: 'chatButtons'
      url: string
      label: string
      parentStepId?: never
    }
  | {
      id: string
      linkType: 'url' | 'email'
      url: string
      label: string
      parentStepId?: string | null
    }

export function getJourneyLinks(
  t: TFunction,
  journey?: Journey
): JourneyLink[] {
  if (journey == null) return []

  const links: JourneyLink[] = []

  // Collect chat buttons as top-level links (no step association)
  const chatButtons = journey.chatButtons ?? []
  chatButtons.forEach((chatButton) => {
    links.push({
      id: chatButton.id,
      linkType: 'chatButtons',
      url: chatButton.link ?? '',
      label: `${t('Chat')}: ${chatButton.platform != null ? MessagePlatform[chatButton.platform] : ''}`
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
        label =
          resolveJourneyCustomizationString(
            block.label,
            journey.journeyCustomizationFields ?? []
          ) ?? ''
        break
      case 'RadioOptionBlock':
        action = block.action
        label =
          resolveJourneyCustomizationString(
            block.label,
            journey.journeyCustomizationFields ?? []
          ) ?? ''
        break
      case 'VideoBlock':
        action = block.action
        label =
          resolveJourneyCustomizationString(
            block.title,
            journey.journeyCustomizationFields ?? []
          ) ?? ''
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
    let linkType: 'url' | 'email' = 'url'
    switch (action.__typename) {
      case 'LinkAction':
        if (action.customizable === true) {
          url = action.url
          parentStepId = action.parentStepId ?? null
          linkType = 'url'
        }
        break
      case 'EmailAction':
        if (action.customizable === true) {
          url = action.email
          parentStepId = action.parentStepId ?? null
          linkType = 'email'
        }
        break
      default:
        url = null
    }
    if (url == null) return

    links.push({
      id: block.id,
      linkType,
      parentStepId,
      url,
      label
    })
  })
  return links
}
