import { TFunction } from 'react-i18next'

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
  }
}
