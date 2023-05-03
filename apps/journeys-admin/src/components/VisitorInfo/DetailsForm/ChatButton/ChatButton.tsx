import { ReactElement } from 'react'
import ChatRoundedIcon from '@mui/icons-material/ChatRounded'
import Button from '@mui/material/Button'
import { MessagePlatform } from '../../../../../__generated__/globalTypes'

interface Props {
  messagePlatform: MessagePlatform | null
  messagePlatformId: string | null
}

export function ChatButton({
  messagePlatform,
  messagePlatformId
}: Props): ReactElement {
  let platformLink: string | undefined
  let platformId: string | undefined | null
  switch (messagePlatform) {
    case MessagePlatform.facebook:
      platformLink = 'https://m.me/'
      platformId = messagePlatformId
      break
    case MessagePlatform.telegram:
      platformLink = 'https://web.telegram.org/z/#'
      platformId = messagePlatformId
      break
    case MessagePlatform.instagram:
      platformLink = 'https://www.instagram.com/direct/t/'
      platformId = messagePlatformId
      break
    case MessagePlatform.snapchat:
      platformLink = 'https://web.snapchat.com/'
      platformId = messagePlatformId
      break
    case MessagePlatform.viber:
      platformLink = 'https://chats.viber.com/'
      platformId = messagePlatformId
      break
    case MessagePlatform.vk:
      platformLink = 'https://vk.com/'
      platformId = messagePlatformId
      break
    case MessagePlatform.line:
      // not sure if this actually links to chat
      platformLink = 'https://line.me/'
      platformId = messagePlatformId
      break
    case MessagePlatform.skype:
      // does not use userId's
      platformLink = 'https://web.skype.com/'
      break
    case MessagePlatform.tikTok:
      // does not use userId's
      platformLink = 'https://www.tiktok.com/messages?lang=en'
      break
    case MessagePlatform.whatsApp:
      // does not use userId's
      platformLink = 'https://web.whatsapp.com/'
      break
  }

  function handleClick(): void {
    if (platformLink == null) return
    if (platformId != null) {
      console.log(platformId)
      window.open(`${platformLink}${platformId}`, '_blank')
    } else {
      window.open(`${platformLink as unknown as string}`, '_blank')
    }
  }

  return (
    <Button
      startIcon={<ChatRoundedIcon />}
      disabled={messagePlatform == null || messagePlatformId == null}
      onClick={handleClick}
    >
      Start Conversation
    </Button>
  )
}
