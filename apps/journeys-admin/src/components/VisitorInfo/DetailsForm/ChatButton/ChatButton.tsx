import { ReactElement } from 'react'
import ChatRoundedIcon from '@mui/icons-material/ChatRounded'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import { MessagePlatform } from '../../../../../__generated__/globalTypes'

interface Props {
  messagePlatform?: MessagePlatform | null
  messagePlatformId?: string | null
}

export function ChatButton({
  messagePlatform,
  messagePlatformId
}: Props): ReactElement {
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
        link = `https://www.instagram.com/${messagePlatformId}`
        break
      case MessagePlatform.facebook:
        link = `https://m.me/${messagePlatformId}`
        break
      case MessagePlatform.whatsApp:
        link = 'https://web.whatsapp.com/'
        break
      case MessagePlatform.skype:
        link = `https://web.skype.com`
        break
      case MessagePlatform.tikTok:
        link = `https://www.tiktok.com/@${messagePlatformId}`
        break
      case MessagePlatform.line:
        // Has no web app and no easy way to link to users
        // link = `https://ln.ee/${messagePlatformId}`
        break
    }
    if (link != null) {
      window.open(link)
    }
  }

  return (
    <Button
      startIcon={<ChatRoundedIcon />}
      disabled={
        messagePlatform == null ||
        messagePlatformId == null ||
        messagePlatform === MessagePlatform.line
      }
      onClick={handleClick}
    >
      {t('Start Conversation')}
    </Button>
  )
}
