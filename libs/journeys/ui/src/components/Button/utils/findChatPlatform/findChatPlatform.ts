import { MessagePlatform } from '../../../../../__generated__/globalTypes'
import { ButtonFields_action } from '../../__generated__/ButtonFields'

export function findChatPlatform(
  buttonAction: ButtonFields_action | null
): MessagePlatform | undefined {
  if (buttonAction?.__typename !== 'LinkAction') return undefined

  const link = buttonAction?.url
  const platform = platforms.find(({ url }) => link.includes(url))

  return platform?.messagePlatform
}

const platforms = [
  {
    url: 'm.me/',
    messagePlatform: MessagePlatform.facebook
  },
  {
    url: 'messenger.com/',
    messagePlatform: MessagePlatform.facebook
  },
  {
    url: 'fb.me/',
    messagePlatform: MessagePlatform.facebook
  },
  {
    url: 't.me/',
    messagePlatform: MessagePlatform.telegram
  },
  {
    url: 'telegram.org/',
    messagePlatform: MessagePlatform.telegram
  },
  {
    url: 'wa.me/',
    messagePlatform: MessagePlatform.whatsApp
  },
  {
    url: 'whatsapp://',
    messagePlatform: MessagePlatform.whatsApp
  },
  {
    url: 'api.whatsapp.com/',
    messagePlatform: MessagePlatform.whatsApp
  },
  {
    url: 'instagram.com/',
    messagePlatform: MessagePlatform.instagram
  },
  {
    url: 'viber://',
    messagePlatform: MessagePlatform.viber
  },
  {
    url: 'vb.me',
    messagePlatform: MessagePlatform.viber
  },
  {
    url: 'viber.me/',
    messagePlatform: MessagePlatform.viber
  },
  {
    url: 'vk://',
    messagePlatform: MessagePlatform.vk
  },
  {
    url: 'vk.com/',
    messagePlatform: MessagePlatform.vk
  },
  {
    url: 'snapchat.com/',
    messagePlatform: MessagePlatform.snapchat
  },
  {
    url: 'skype',
    messagePlatform: MessagePlatform.skype
  },
  {
    url: 'line://',
    messagePlatform: MessagePlatform.line
  },
  {
    url: 'line.me',
    messagePlatform: MessagePlatform.line
  },
  {
    url: 'tiktok.com/@',
    messagePlatform: MessagePlatform.tikTok
  }
]
