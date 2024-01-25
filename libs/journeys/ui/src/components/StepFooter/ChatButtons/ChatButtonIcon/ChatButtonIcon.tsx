import { useTheme } from '@mui/material/styles'
import { ReactElement } from 'react'

import Facebook from '@core/shared/ui/icons/Facebook'
import Instagram from '@core/shared/ui/icons/Instagram'
import Line from '@core/shared/ui/icons/Line'
import MessageTyping from '@core/shared/ui/icons/MessageTyping'
import Skype from '@core/shared/ui/icons/Skype'
import Snapchat from '@core/shared/ui/icons/Snapchat'
import Telegram from '@core/shared/ui/icons/Telegram'
import Tiktok from '@core/shared/ui/icons/Tiktok'
import Viber from '@core/shared/ui/icons/Viber'
import Vk from '@core/shared/ui/icons/Vk'
import WhatsApp from '@core/shared/ui/icons/WhatsApp'

import { ChatPlatform } from '../../../../../__generated__/globalTypes'

interface ChatButtonIconProps {
  platform: ChatPlatform | null
  primary: boolean
}

export function ChatButtonIcon({
  platform,
  primary
}: ChatButtonIconProps): ReactElement {
  const theme = useTheme()

  const platformIcons = {
    facebook: Facebook,
    telegram: Telegram,
    whatsApp: WhatsApp,
    instagram: Instagram,
    viber: Viber,
    vk: Vk,
    snapchat: Snapchat,
    skype: Skype,
    line: Line,
    tikTok: Tiktok,
    custom: MessageTyping
  }

  const Icon = platformIcons[platform ?? ChatPlatform.custom]

  return (
    <Icon
      sx={{
        color: primary ? theme.palette.grey[900] : theme.palette.grey[100]
      }}
    />
  )
}
