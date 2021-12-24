import { createElement, ReactElement } from 'react'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import TranslateRounded from '@mui/icons-material/TranslateRounded'
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded'
import FormatQuoteRounded from '@mui/icons-material/FormatQuoteRounded'
import LockOpenRounded from '@mui/icons-material/LockOpenRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded'
import LiveTvRounded from '@mui/icons-material/LiveTvRounded'
import MenuBookRounded from '@mui/icons-material/MenuBookRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import BeenhereRounded from '@mui/icons-material/BeenhereRounded'
import SendRounded from '@mui/icons-material/SendRounded'
import SubscriptionsRounded from '@mui/icons-material/SubscriptionsRounded'
import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded'
import { ButtonFields_startIcon as IconType } from '../Button/__generated__/ButtonFields'

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
    CheckCircleRounded,
    PlayArrowRounded,
    TranslateRounded,
    RadioButtonUncheckedRounded,
    FormatQuoteRounded,
    LockOpenRounded,
    ArrowForwardRounded,
    ChatBubbleOutlineRounded,
    LiveTvRounded,
    MenuBookRounded,
    ChevronRightRounded,
    BeenhereRounded,
    SendRounded,
    SubscriptionsRounded,
    ContactSupportRounded
  }

  return createElement(icons[name], {
    color: color ?? undefined,
    sx: { fontSize }
  })
}
