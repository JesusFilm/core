import { createElement, ReactElement } from 'react'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded'
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded'
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import LiveTvRoundedIcon from '@mui/icons-material/LiveTvRounded'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import BeenhereRoundedIcon from '@mui/icons-material/BeenhereRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import SubscriptionsRoundedIcon from '@mui/icons-material/SubscriptionsRounded'
import ContactSupportRoundedIcon from '@mui/icons-material/ContactSupportRounded'

import { ButtonFields_startIcon as IconType } from '../../../__generated__/ButtonFields'

export function Icon({ name, color, size }: IconType): ReactElement | null {
  const fontSize =
    size === 'sm'
      ? '16px'
      : size === 'md'
      ? '20px'
      : size === 'lg'
      ? '28px'
      : size === 'xl'
      ? '48px'
      : 'inherit'

  const icons = {
    CheckCircleRounded: CheckCircleRoundedIcon,
    PlayArrowRounded: PlayArrowRoundedIcon,
    TranslateRounded: TranslateRoundedIcon,
    RadioButtonUncheckedRounded: RadioButtonUncheckedRoundedIcon,
    FormatQuoteRounded: FormatQuoteRoundedIcon,
    LockOpenRounded: LockOpenRoundedIcon,
    ArrowForwardRounded: ArrowForwardRoundedIcon,
    ChatBubbleOutlineRounded: ChatBubbleOutlineRoundedIcon,
    LiveTvRounded: LiveTvRoundedIcon,
    MenuBookRounded: MenuBookRoundedIcon,
    ChevronRightRounded: ChevronRightRoundedIcon,
    BeenhereRounded: BeenhereRoundedIcon,
    SendRounded: SendRoundedIcon,
    SubscriptionsRounded: SubscriptionsRoundedIcon,
    ContactSupportRounded: ContactSupportRoundedIcon
  }

  return createElement(icons[name], {
    color: color ?? undefined,
    sx: { fontSize }
  })
}
