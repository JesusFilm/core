import { TFunction } from 'i18next'

import { MessagePlatform } from '../../../../../../__generated__/globalTypes'

export function messagePlatformToLabel(
  messagePlatform: MessagePlatform,
  t: TFunction<'apps-journeys-admin', undefined>
): string {
  switch (messagePlatform) {
    case MessagePlatform.facebook:
      return t('Facebook')
    case MessagePlatform.instagram:
      return t('Instagram')
    case MessagePlatform.line:
      return t('LINE')
    case MessagePlatform.skype:
      return t('Skype')
    case MessagePlatform.snapchat:
      return t('Snapchat')
    case MessagePlatform.telegram:
      return t('Telegram')
    case MessagePlatform.tikTok:
      return t('TikTok')
    case MessagePlatform.viber:
      return t('Viber')
    case MessagePlatform.vk:
      return t('VK')
    case MessagePlatform.whatsApp:
      return t('WhatsApp')
    case MessagePlatform.custom:
      return t('Custom')
    case MessagePlatform.globe2:
      return t('Globe 1')
    case MessagePlatform.globe3:
      return t('Globe 2')
    case MessagePlatform.messageText1:
      return t('Message Text Circle')
    case MessagePlatform.messageText2:
      return t('Message Text Square')
    case MessagePlatform.send1:
      return t('Send 1')
    case MessagePlatform.send2:
      return t('Send 2')
    case MessagePlatform.messageChat2:
      return t('Message Chat Circle')
    case MessagePlatform.messageCircle:
      return t('Message Circle')
    case MessagePlatform.messageNotifyCircle:
      return t('Message Notify Circle')
    case MessagePlatform.messageNotifySquare:
      return t('Message Notify Square')
    case MessagePlatform.messageSquare:
      return t('Message Square')
    case MessagePlatform.mail1:
      return t('Mail')
    case MessagePlatform.linkExternal:
      return t('Link External')
    case MessagePlatform.home3:
      return t('Home 1')
    case MessagePlatform.home4:
      return t('Home 2')
    case MessagePlatform.helpCircleContained:
      return t('Help Circle')
    case MessagePlatform.helpSquareContained:
      return t('Help Square')
    case MessagePlatform.shieldCheck:
      return t('Shield Check')
    case MessagePlatform.menu1:
      return t('Menu')
    case MessagePlatform.checkBroken:
      return t('Check Broken')
    case MessagePlatform.checkContained:
      return t('Check Contained')
    case MessagePlatform.settings:
      return t('Settings')
  }
}
