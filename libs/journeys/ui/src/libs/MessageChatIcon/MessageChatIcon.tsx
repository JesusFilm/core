import { SxProps } from '@mui/material/styles'
import { ReactElement } from 'react'

import CheckBroken from '@core/shared/ui/icons/CheckBroken'
import CheckContained from '@core/shared/ui/icons/CheckContained'
import Discord from '@core/shared/ui/icons/Discord'
import Facebook from '@core/shared/ui/icons/Facebook'
import Globe2 from '@core/shared/ui/icons/Globe2'
import Globe3 from '@core/shared/ui/icons/Globe3'
import HelpCircleContained from '@core/shared/ui/icons/HelpCircleContained'
import HelpSquareContained from '@core/shared/ui/icons/HelpSquareContained'
import Home3 from '@core/shared/ui/icons/Home3'
import Home4 from '@core/shared/ui/icons/Home4'
import Instagram from '@core/shared/ui/icons/Instagram'
import KakaoTalk from '@core/shared/ui/icons/KakaoTalk'
import Line from '@core/shared/ui/icons/Line'
import LinkExternal from '@core/shared/ui/icons/LinkExternal'
import Mail1 from '@core/shared/ui/icons/Mail1'
import Menu1 from '@core/shared/ui/icons/Menu1'
import MessageChat2 from '@core/shared/ui/icons/MessageChat2'
import MessageCircle from '@core/shared/ui/icons/MessageCircle'
import MessageNotifyCircle from '@core/shared/ui/icons/MessageNotifyCircle'
import MessageNotifySquare from '@core/shared/ui/icons/MessageNotifySquare'
import MessageSquare from '@core/shared/ui/icons/MessageSquare'
import MessageText1 from '@core/shared/ui/icons/MessageText1'
import MessageText2 from '@core/shared/ui/icons/MessageText2'
import MessageTyping from '@core/shared/ui/icons/MessageTyping'
import Send1 from '@core/shared/ui/icons/Send1'
import Send2 from '@core/shared/ui/icons/Send2'
import Settings from '@core/shared/ui/icons/Settings'
import ShieldCheck from '@core/shared/ui/icons/ShieldCheck'
import Signal from '@core/shared/ui/icons/Signal'
import Skype from '@core/shared/ui/icons/Skype'
import Snapchat from '@core/shared/ui/icons/Snapchat'
import Telegram from '@core/shared/ui/icons/Telegram'
import Tiktok from '@core/shared/ui/icons/Tiktok'
import Viber from '@core/shared/ui/icons/Viber'
import Vk from '@core/shared/ui/icons/Vk'
import WeChat from '@core/shared/ui/icons/WeChat'
import WhatsApp from '@core/shared/ui/icons/WhatsApp'

import { MessagePlatform } from '../../../__generated__/globalTypes'

interface ChatIconProps {
  platform: MessagePlatform
  sx?: SxProps
}

export function MessageChatIcon({ platform, sx }: ChatIconProps): ReactElement {
  const platformComponents = {
    facebook: Facebook,
    telegram: Telegram,
    whatsApp: WhatsApp,
    instagram: Instagram,
    kakaoTalk: KakaoTalk,
    viber: Viber,
    snapchat: Snapchat,
    line: Line,
    tikTok: Tiktok,
    discord: Discord,
    signal: Signal,
    weChat: WeChat,
    custom: MessageTyping,
    globe3: Globe3,
    helpCircleContained: HelpCircleContained,
    mail1: Mail1,
    // ===== DEPRECATED BUT KEPT FOR BACKWARD COMPATIBILITY =====
    // Keep these so existing journeys don't break
    globe2: Globe2,
    vk: Vk,
    skype: Skype,
    messageText1: MessageText1,
    messageText2: MessageText2,
    send1: Send1,
    send2: Send2,
    messageChat2: MessageChat2,
    messageCircle: MessageCircle,
    messageNotifyCircle: MessageNotifyCircle,
    messageNotifySquare: MessageNotifySquare,
    messageSquare: MessageSquare,
    linkExternal: LinkExternal,
    home3: Home3,
    home4: Home4,
    helpSquareContained: HelpSquareContained,
    shieldCheck: ShieldCheck,
    menu1: Menu1,
    checkBroken: CheckBroken,
    checkContained: CheckContained,
    settings: Settings
  }

  const IconComponent = platformComponents[platform]
  return <IconComponent sx={sx} />
}
