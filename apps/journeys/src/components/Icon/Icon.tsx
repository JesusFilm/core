import { createElement, ReactElement } from 'react'
import {
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
} from '@mui/icons-material'
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
