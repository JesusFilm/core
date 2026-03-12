import { TFunction } from 'i18next'

import { resolveJourneyCustomizationString } from '@core/journeys/ui/resolveJourneyCustomizationString'

import {
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_VideoTriggerBlock as VideoTriggerBlock
} from '../../../../../__generated__/GetJourney'
import {
  ContactActionType,
  MessagePlatform
} from '../../../../../__generated__/globalTypes'

export const messagePlatformDisplayNames: Record<MessagePlatform, string> = {
  [MessagePlatform.custom]: 'Chat',
  [MessagePlatform.facebook]: 'Facebook Messenger',
  [MessagePlatform.instagram]: 'Instagram',
  [MessagePlatform.kakaoTalk]: 'KakaoTalk',
  [MessagePlatform.line]: 'LINE',
  [MessagePlatform.skype]: 'Skype',
  [MessagePlatform.snapchat]: 'Snapchat',
  [MessagePlatform.telegram]: 'Telegram',
  [MessagePlatform.tikTok]: 'TikTok',
  [MessagePlatform.viber]: 'Viber',
  [MessagePlatform.vk]: 'VK',
  [MessagePlatform.whatsApp]: 'WhatsApp',
  [MessagePlatform.globe2]: 'Globe 1',
  [MessagePlatform.globe3]: 'Globe 2',
  [MessagePlatform.messageText1]: 'Message Text Circle',
  [MessagePlatform.messageText2]: 'Message Text Square',
  [MessagePlatform.send1]: 'Send 1',
  [MessagePlatform.send2]: 'Send 2',
  [MessagePlatform.messageChat2]: 'Message Chat Circle',
  [MessagePlatform.messageCircle]: 'Message Circle',
  [MessagePlatform.messageNotifyCircle]: 'Message Notify Circle',
  [MessagePlatform.messageNotifySquare]: 'Message Notify Square',
  [MessagePlatform.messageSquare]: 'Message Square',
  [MessagePlatform.mail1]: 'Mail',
  [MessagePlatform.linkExternal]: 'Link External',
  [MessagePlatform.home3]: 'Home 1',
  [MessagePlatform.home4]: 'Home 2',
  [MessagePlatform.helpCircleContained]: 'Help Circle',
  [MessagePlatform.helpSquareContained]: 'Help Square',
  [MessagePlatform.shieldCheck]: 'Shield Check',
  [MessagePlatform.menu1]: 'Menu',
  [MessagePlatform.checkBroken]: 'Check Broken',
  [MessagePlatform.checkContained]: 'Check Contained',
  [MessagePlatform.settings]: 'Settings'
}

export type JourneyLink =
  | {
      id: string
      linkType: 'chatButtons'
      url: string
      label: string
      platform: MessagePlatform
      parentStepId?: never
    }
  | {
      id: string
      linkType: 'url' | 'email' | 'phone'
      url: string
      label: string
      parentStepId?: string | null
      customizable?: boolean | null
      contactAction?: ContactActionType | null
    }

export function getJourneyLinks(
  t: TFunction,
  journey?: Journey
): JourneyLink[] {
  if (journey == null) return []

  const links: JourneyLink[] = []

  const chatButtons = journey.chatButtons ?? []
  chatButtons.forEach((chatButton) => {
    if (chatButton.customizable !== true) return
    links.push({
      id: chatButton.id,
      linkType: 'chatButtons',
      url: chatButton.link ?? '',
      label: t('Chat Widget'),
      platform: chatButton.platform ?? MessagePlatform.custom
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
    let customizable: boolean | null = null
    let linkType: 'url' | 'email' | 'phone' = 'url'
    switch (action.__typename) {
      case 'LinkAction':
        if (action.customizable === true) {
          url = action.url
          parentStepId = action.parentStepId ?? null
          linkType = 'url'
          customizable = action.customizable
        }
        break
      case 'EmailAction':
        if (action.customizable === true) {
          url = action.email
          parentStepId = action.parentStepId ?? null
          linkType = 'email'
          customizable = action.customizable
        }
        break
      case 'PhoneAction':
        if (action.customizable === true) {
          url = action.phone
          parentStepId = action.parentStepId ?? null
          linkType = 'phone'
          customizable = action.customizable
          // Preserve contact action so callers can decide tel: vs sms:
          const ca = (action as { contactAction?: ContactActionType })
            ?.contactAction
          links.push({
            id: block.id,
            linkType,
            parentStepId,
            url,
            customizable,
            contactAction: ca ?? null,
            label:
              label == null || label === '' ? t('No label provided') : label
          })
          return
        }
        break
      case 'ChatAction':
        if (action.customizable === true) {
          url = action.chatUrl
          parentStepId = action.parentStepId ?? null
          linkType = 'url'
          customizable = action.customizable
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
      customizable,
      label: label == null || label === '' ? t('No label provided') : label
    })
  })
  return links
}
