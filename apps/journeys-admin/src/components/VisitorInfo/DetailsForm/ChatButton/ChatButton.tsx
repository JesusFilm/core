import Button from '@mui/material/Button'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import MessageText1Icon from '@core/shared/ui/icons/MessageText1'

import { MessagePlatform } from '../../../../../__generated__/globalTypes'

interface ChatButtonProps {
  messagePlatform?: MessagePlatform | null
  messagePlatformId?: string | null
}

export function ChatButton({
  messagePlatform,
  messagePlatformId
}: ChatButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  function handleClick(): void {
    if (messagePlatformId == null) return
    let link: string | undefined
    switch (messagePlatform) {
      case MessagePlatform.telegram:
        link = `https://web.telegram.org/z/#${messagePlatformId}`
        break
      case MessagePlatform.viber:
        link = `https://chats.viber.com/${messagePlatformId}`
        break
      case MessagePlatform.vk:
        link = `https://vk.com/${messagePlatformId}`
        break
      case MessagePlatform.snapchat:
        link = `https://web.snapchat.com/${messagePlatformId}`
        break
      case MessagePlatform.instagram:
        // needs the id (can't be username)
        link = `https://www.instagram.com/direct/t/${messagePlatformId}`
        break
      case MessagePlatform.facebook:
        // doesn't always work
        link = `https://m.me/${messagePlatformId}`
        break
      case MessagePlatform.whatsApp:
        // doesn't open in web app
        // link = 'https://web.whatsapp.com/'
        link = `https://wa.me/${messagePlatformId}`
        break
      case MessagePlatform.skype:
        // link = `https://web/skype:${messagePlatformId}?chat`
        link = `https://web.skype.com`
        break
      case MessagePlatform.tikTok:
        // opens profile rather than messages
        // platformLink = 'https://www.tiktok.com/messages?lang=en'
        link = `https://www.tiktok.com/@${messagePlatformId}`
        break
      case MessagePlatform.line:
        link = `https://ln.ee/${messagePlatformId}`
        break
    }
    if (link != null) {
      window.open(link)
    }
  }

  return (
    <Button
      startIcon={<MessageText1Icon />}
      disabled={messagePlatform == null || messagePlatformId == null}
      onClick={handleClick}
    >
      {t('Open conversation')}
    </Button>
  )
}
